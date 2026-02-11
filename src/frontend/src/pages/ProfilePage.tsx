import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, User, Mail, MapPin, Globe, Info, Edit2, Save, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    city: '',
    country: '',
  });

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleEdit = () => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName,
        email: userProfile.email,
        city: userProfile.city,
        country: userProfile.country,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: '',
      email: '',
      city: '',
      country: '',
    });
  };

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({
        ...formData,
        onboarded: true,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </div>
              {!isEditing && userProfile && (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {userProfile ? (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm font-medium">{userProfile.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-sm font-medium">{userProfile.email || 'Not set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Enter your city"
                    />
                  ) : (
                    <p className="text-sm font-medium">{userProfile.city || 'Not set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Country
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Enter your country"
                    />
                  ) : (
                    <p className="text-sm font-medium">{userProfile.country || 'Not set'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={saveProfile.isPending} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" disabled={saveProfile.isPending}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Profile information is not available. Please complete onboarding.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internet Identity</CardTitle>
            <CardDescription>Your decentralized authentication principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Principal ID</Label>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                {identity?.getPrincipal().toString()}
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Your Principal ID is your unique identifier on the Internet Computer blockchain. Keep it safe and never
                share your Internet Identity credentials.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
