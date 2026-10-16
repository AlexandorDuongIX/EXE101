import { useHealthHomeController } from '@/controllers/health/use-health-home-controller';
import { HealthEntryModal } from '@/views/components/health/health-entry-modal';
import { HealthHomeContent } from '@/views/components/health/health-home-content';

export default function FamilyHomeScreen() {
  const controller = useHealthHomeController();
  return (
    <>
      <HealthHomeContent controller={controller} />
      <HealthEntryModal
        visible={controller.entryMode !== null}
        mode={controller.entryMode ?? 'reading'}
        recipientName={controller.selectedSenior?.fullName ?? ''}
        values={controller.entryValues}
        errors={controller.entryErrors}
        submitError={controller.entrySubmitError}
        onChange={controller.changeEntryField}
        onSave={controller.saveEntry}
        onClose={controller.closeEntry}
      />
    </>
  );
}
