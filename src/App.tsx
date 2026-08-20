import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { AuthPage } from '@/auth/AuthPage';
import { LandingPage } from '@/landing/LandingPage';
import { supabase, type Profile, type BlueprintStage } from '@/lib/supabase';
import { ProfileFlow } from '@/blueprint/ProfileFlow';
import { CognitiveTransition } from '@/blueprint/CognitiveTransition';
import { CognitiveFlow } from '@/blueprint/CognitiveFlow';
import { ChatDashboard } from '@/dashboard/ChatDashboard';
import type { ProfileAnswers } from '@/blueprint/profileQuestions';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loggedOutView, setLoggedOutView] = useState<'landing' | 'auth'>('landing');

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      setLoggedOutView('landing');
      return;
    }
    let active = true;
    setProfileLoading(true);
    setProfileError(null);
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setProfileError('We could not load your blueprint. Please refresh and try again.');
        } else if (data) {
          setProfile(data as Profile);
        } else {
          supabase
            .from('profiles')
            .insert({ user_id: user.id })
            .select()
            .maybeSingle()
            .then(({ data: created, error: createError }) => {
              if (!active) return;
              if (createError) {
                setProfileError('We could not start your blueprint. Please refresh and try again.');
              } else {
                setProfile(created as Profile);
              }
              setProfileLoading(false);
            });
          return;
        }
        setProfileLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading || (user && profileLoading)) return <LoadingScreen />;
  if (!user) {
    if (loggedOutView === 'auth') return <AuthPage />;
    return (
      <LandingPage
        onGetStarted={() => setLoggedOutView('auth')}
        onLogIn={() => setLoggedOutView('auth')}
      />
    );
  }
  if (profileError) return <ErrorScreen message={profileError} onRetry={() => window.location.reload()} />;

  async function saveProfileAnswers(answers: ProfileAnswers) {
    if (!user) return;
    const payload = mapAnswersToProfile(answers, user.id);
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();
    if (error) {
      setProfileError('We could not save your answers. Please try again.');
      return;
    }
    setProfile((data as Profile) ?? { ...payload, blueprint_stage: 'cognitive', profile_step: 0, cognitive_step: 0 });
  }

  async function beginCognitive() {
    if (!user || !profile) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ blueprint_stage: 'cognitive', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) {
      setProfileError('We could not start the skill assessment. Please try again.');
      return;
    }
    setProfile((data as Profile) ?? { ...profile, blueprint_stage: 'cognitive' });
  }

  async function finishCognitive() {
    if (!user || !profile) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ blueprint_stage: 'done', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) {
      setProfileError('We could not finish your blueprint. Please try again.');
      return;
    }
    setProfile((data as Profile) ?? { ...profile, blueprint_stage: 'done' });
  }

  async function updateProfileStep(step: number) {
    if (!user) return;
    await supabase.from('profiles').update({ profile_step: step, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  }

  if (!profile) {
    return (
      <ProfileFlow
        initialAnswers={{}}
        initialStep={0}
        onComplete={async (answers) => {
          const payload = mapAnswersToProfile(answers, user.id);
          payload.blueprint_stage = 'cognitive';
          await saveProfileAnswers({ ...answers });
        }}
      />
    );
  }

  if (profile.blueprint_stage === 'profile') {
    return (
      <ProfileFlow
        initialAnswers={profileToAnswers(profile)}
        initialStep={profile.profile_step}
        onComplete={saveProfileAnswers}
        onStepChange={updateProfileStep}
      />
    );
  }

  if (profile.blueprint_stage === 'cognitive') {
    // First visit to cognitive stage shows the transition; returning users resume the game index.
    if (profile.cognitive_step === 0 && !sessionStorage.getItem(`blueprint-started-${user.id}`)) {
      return (
        <CognitiveTransition
          onContinue={() => {
            sessionStorage.setItem(`blueprint-started-${user.id}`, '1');
            void beginCognitive();
          }}
        />
      );
    }
    return (
      <CognitiveFlow
        userId={user.id}
        hobbies={profile.hobbies}
        favoriteSubject={profile.favorite_subject}
        startIndex={profile.cognitive_step}
        onComplete={finishCognitive}
        onStepChange={async (step) => {
          await supabase
            .from('profiles')
            .update({ cognitive_step: step, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
          setProfile((current) => (current ? { ...current, cognitive_step: step } : current));
        }}
      />
    );
  }

  return <ChatDashboard profile={profile} onSignOut={signOut} />;
}

function mapAnswersToProfile(answers: ProfileAnswers, userId: string) {
  return {
    user_id: userId,
    name: typeof answers.name === 'string' ? answers.name : null,
    age: typeof answers.age === 'number' ? answers.age : null,
    grade: typeof answers.grade === 'string' ? answers.grade : null,
    subjects: Array.isArray(answers.subjects) ? answers.subjects : [],
    favorite_subject: typeof answers.favorite_subject === 'string' ? answers.favorite_subject : null,
    strongest_subject: typeof answers.strongest_subject === 'string' ? answers.strongest_subject : null,
    weakest_subject: typeof answers.weakest_subject === 'string' ? answers.weakest_subject : null,
    last_year_percentage: typeof answers.last_year_percentage === 'number' ? answers.last_year_percentage : null,
    goal_percentage: typeof answers.goal_percentage === 'number' ? answers.goal_percentage : null,
    hobbies: Array.isArray(answers.hobbies) ? answers.hobbies : [],
    hobby_skills: Array.isArray(answers.hobby_skills) ? answers.hobby_skills : [],
    study_hours: typeof answers.study_hours === 'string' ? answers.study_hours : null,
    blueprint_stage: 'cognitive' as BlueprintStage,
    profile_step: 0,
    cognitive_step: 0,
    updated_at: new Date().toISOString(),
  };
}

function profileToAnswers(profile: Profile): ProfileAnswers {
  return {
    name: profile.name,
    age: profile.age,
    grade: profile.grade,
    subjects: profile.subjects,
    favorite_subject: profile.favorite_subject,
    strongest_subject: profile.strongest_subject,
    weakest_subject: profile.weakest_subject,
    last_year_percentage: profile.last_year_percentage,
    goal_percentage: profile.goal_percentage,
    hobbies: profile.hobbies,
    hobby_skills: profile.hobby_skills,
    study_hours: profile.study_hours,
  };
}

function LoadingScreen() {
  return (
    <div className="app-bg flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-lavender-200/70">
        <div className="h-3 w-3 animate-pulse rounded-full bg-neon-purple" />
        <span>Loading your blueprint…</span>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <p className="text-neon-magenta">{message}</p>
        <button onClick={onRetry} className="mt-4 text-sm text-lavender-200 underline hover:text-white">Try again</button>
      </div>
    </div>
  );
}

export default App;
