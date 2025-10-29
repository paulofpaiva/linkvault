import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignIn from '@/pages/auth/components/SignIn';
import SignUp from '@/pages/auth/components/SignUp';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSignUp = location.pathname.includes('sign-up');
  const [activeTab, setActiveTab] = useState(isSignUp ? 'sign-up' : 'sign-in');

  useEffect(() => {
    const isSignUpPath = location.pathname.includes('sign-up');
    setActiveTab(isSignUpPath ? 'sign-up' : 'sign-in');
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/auth/${value}`);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">linkvault</CardTitle>
        <CardDescription>
          Organize your links in a smart way
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignIn />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUp />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

