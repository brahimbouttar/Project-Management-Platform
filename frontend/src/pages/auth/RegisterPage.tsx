import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', username: '', password: '', displayName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const register = useRegister();

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.username || form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register.mutateAsync(form);
    } catch (err: any) {
      setErrors({ form: err.response?.data?.error || 'Registration failed' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-gray-500">Get started with your workspace</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errors.form}</div>
            )}
            <Input
              id="displayName"
              label="Display Name"
              value={form.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              id="username"
              label="Username"
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              error={errors.username}
              placeholder="your-username"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              placeholder="Min 6 characters"
            />
            <Button type="submit" className="w-full" loading={register.isPending}>
              Create Account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
