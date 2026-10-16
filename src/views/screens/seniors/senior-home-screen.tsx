import { useHealthHomeController } from '@/controllers/health/use-health-home-controller';
import { HealthHomeContent } from '@/views/components/health/health-home-content';

export default function SeniorHomeScreen() {
  const controller = useHealthHomeController();
  return <HealthHomeContent controller={controller} />;
}
