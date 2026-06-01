import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWorkspace } from '../../hooks/useWorkspace';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AppLayout from '../../components/layout/AppLayout';

const CreateWorkspacePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const createWorkspace = useCreateWorkspace();
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.slug) newErrors.slug = 'Slug is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const workspace = await createWorkspace.mutateAsync(form);
      navigate(`/w/${workspace.slug}`);
    } catch (err: any) {
      setErrors({ form: err.response?.data?.error || 'Failed to create workspace' });
    }
  };

  return (
    <AppLayout hideSidebar>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Workspace</h1>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errors.form}</div>
            )}
            <Input
              id="name"
              label="Workspace Name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              error={errors.name}
              placeholder="e.g., Acme Corp"
            />
            <Input
              id="slug"
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              error={errors.slug}
              placeholder="acme-corp"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="input-field resize-none"
                placeholder="What's this workspace about?"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/workspaces')}>
                Cancel
              </Button>
              <Button type="submit" loading={createWorkspace.isPending}>
                Create Workspace
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateWorkspacePage;
