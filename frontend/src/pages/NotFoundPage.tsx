import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { FileQuestion } from 'lucide-react';

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <FileQuestion className="mx-auto mb-4 h-16 w-16 text-gray-300" />
      <h1 className="mb-2 text-4xl font-bold text-gray-900">404</h1>
      <p className="mb-6 text-gray-500">The page you're looking for doesn't exist.</p>
      <Link to="/workspaces">
        <Button>Go to Workspaces</Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
