import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';

export type AppRole = 'superadmin' | 'user';
export type OrgRole = 'admin' | 'member';

export interface UserOrganization {
  id: string;
  name: string;
  role: OrgRole;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  app_role: AppRole;
  organizations: UserOrganization[];
  current_organization: UserOrganization | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  currentOrganization: UserOrganization | null;
  switchOrganization: (orgId: string) => void;
  signUp: (email: string, password: string, fullName?: string, organizationId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<UserOrganization | null>(null);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Fetch user's app role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleError);
      }

      const appRole: AppRole = roleData?.role === 'superadmin' ? 'superadmin' : 'user';

      // Fetch user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch user's organizations
      const { data: orgData, error: orgError } = await supabase
        .from('organization_users')
        .select(`
          role,
          organization_id,
          organizations (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
      }

      const organizations: UserOrganization[] = (orgData || []).map((item: any) => ({
        id: item.organizations.id,
        name: item.organizations.name,
        role: item.role as OrgRole,
        created_at: item.organizations.created_at,
      }));

      // Get current org from localStorage or default to first org
      const storedOrgId = localStorage.getItem(`currentOrg_${userId}`);
      const currentOrg = organizations.find(org => org.id === storedOrgId) || organizations[0] || null;

      const profile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        app_role: appRole,
        organizations,
        current_organization: currentOrg,
      };

      setUserProfile(profile);
      setCurrentOrganization(currentOrg);
      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const refetchProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const switchOrganization = (orgId: string) => {
    if (!userProfile) return;
    
    const org = userProfile.organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem(`currentOrg_${userProfile.id}`, orgId);
      
      // Update the profile with new current org
      setUserProfile({
        ...userProfile,
        current_organization: org,
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile in background, don't block loading
          fetchUserProfile(session.user.id).catch(console.error);
        } else {
          setUserProfile(null);
          setCurrentOrganization(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log("Initial session error:", error);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile in background, don't block loading
        fetchUserProfile(session.user.id).catch(console.error);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, organizationId?: string) => {
    // Use the auth page for email confirmation redirect
    const redirectUrl = `${window.location.origin}/taskpane.html`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          organization_id: organizationId,
        }
      }
    });

    // Check for duplicate email - if user exists but has no identities, it means email is already registered
    if (!error && data.user && data.user.identities && data.user.identities.length === 0) {
      return { 
        error: { 
          message: 'An account with this email already exists. Please sign in or reset your password if you\'ve forgotten it.',
          code: 'DUPLICATE_EMAIL'
        } 
      };
    }

    // If signup is successful and we have organization ID, add user to organization
    if (!error && data.user && organizationId) {
      try {
        // Add user to organization_users table
        const { error: orgError } = await supabase
          .from('organization_users')
          .insert({
            user_id: data.user.id,
            organization_id: organizationId,
            role: 'member'
          });

        if (orgError) {
          console.error('Error adding user to organization:', orgError);
        }
      } catch (orgError) {
        console.error('Error in organization assignment:', orgError);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    userProfile,
    currentOrganization,
    switchOrganization,
    signUp,
    signIn,
    signOut,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

