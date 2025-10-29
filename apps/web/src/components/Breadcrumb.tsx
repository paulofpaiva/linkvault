import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbProps {
  label?: string;
  backTo?: string;
  className?: string;
}

export default function Breadcrumb({ 
  label = 'Back', 
  backTo, 
  className = '' 
}: BreadcrumbProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="pl-0 hover:bg-transparent hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {label}
      </Button>
    </div>
  );
}

