// PROTOTYPE (wayfinder ticket #1601) — throwaway, do not use in production code.
// Three variants of the UploadBallots dialog UX, switchable via ?variant=,
// mounted on a throwaway /admin/prototype_upload_ballots route so it renders
// with the real election chrome (header, Sidebar) — see Admin.tsx.
import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import PrototypeSwitcher from '~/components/PrototypeSwitcher';
import VariantA from './prototype1601VariantA';
import VariantB from './prototype1601VariantB';
import VariantC from './prototype1601VariantC';

const VARIANTS = [
    { key: 'A', label: 'Stacked dialog off Manage Voters' },
    { key: 'B', label: 'Wizard + dedicated Ballots page' },
    { key: 'C', label: 'No dialog — inline panel off Admin Home' },
];

const Prototype1601UploadBallots = () => {
    const [searchParams] = useSearchParams();
    const variant = searchParams.get('variant') ?? 'A';

    return (
        <Box sx={{ pb: 8 }}>
            <Typography variant="body2" sx={{ mb: 2, p: 1, backgroundColor: '#fff8e1', border: '1px solid #ffb300' }}>
                Wayfinder prototype for issue #1601 — throwaway, not real. All parsing/upload/roll-check logic is mocked.
            </Typography>
            {variant === 'A' && <VariantA />}
            {variant === 'B' && <VariantB />}
            {variant === 'C' && <VariantC />}
            <PrototypeSwitcher variants={VARIANTS} current={variant} />
        </Box>
    );
};

export default Prototype1601UploadBallots;
