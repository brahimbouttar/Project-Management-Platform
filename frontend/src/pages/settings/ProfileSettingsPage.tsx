import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const ProfileSettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors({ avatar: 'Image must be under 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!displayName.trim()) {
      setErrors({ displayName: 'Display name is required' });
      return;
    }

    try {
      await updateProfile.mutateAsync({ displayName, avatar: avatar || undefined });
    } catch {
      setErrors({ form: 'Failed to update profile' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and profile picture</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <Avatar name={displayName || 'U'} src={avatar} size="lg" />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
              {errors.avatar && <p className="mt-1 text-xs text-red-600">{errors.avatar}</p>}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h2>
          <div className="space-y-4">
            {errors.form && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errors.form}</div>
            )}

            <Input
              id="email"
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
            />

            <Input
              id="username"
              label="Username"
              value={user?.username || ''}
              disabled
            />

            <Input
              id="displayName"
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={errors.displayName}
              placeholder="Your display name"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" loading={updateProfile.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
