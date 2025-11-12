import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, MessageSquare } from "lucide-react";

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button variant="outline" onClick={() => navigate("/chat")}>
            Back to Chat
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="flex items-center gap-2 text-lg">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="break-all text-sm">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {isAdmin ? "Administrator" : "User"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Activity
              </CardTitle>
              <CardDescription>Your chat activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View your chat history and conversations in the main chat interface.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/chat")}
              >
                Go to Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>
                You have administrator privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Access the admin dashboard to manage FAQs and announcements.
              </p>
              <Button onClick={() => navigate("/admin")}>
                Open Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
