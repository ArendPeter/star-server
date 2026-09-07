// Generic floating variant-switcher bar for UI prototypes (see the `prototype` skill).
// Reads/writes `?variant=` via the router so the current variant is shareable and
// reload-stable. Hidden in production builds.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

type Variant = { key: string; label: string };

const PrototypeSwitcher = ({ variants, current }: { variants: Variant[]; current: string }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    if (process.env.NODE_ENV === 'production') return null;

    const currentIndex = Math.max(0, variants.findIndex(v => v.key === current));

    const go = (delta: number) => {
        const nextIndex = (currentIndex + delta + variants.length) % variants.length;
        const next = new URLSearchParams(searchParams);
        next.set('variant', variants[nextIndex].key);
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
            if (target?.isContentEditable) return;
            if (e.key === 'ArrowLeft') go(-1);
            if (e.key === 'ArrowRight') go(1);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [currentIndex, searchParams]);

    const active = variants[currentIndex];

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: 999,
                backgroundColor: '#111',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                border: '2px solid #ffb300',
            }}
        >
            <IconButton size="small" onClick={() => go(-1)} sx={{ color: '#fff' }}>
                <ArrowBackIosNewIcon fontSize="inherit" />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 200, textAlign: 'center' }}>
                PROTOTYPE — {active?.key} — {active?.label}
            </Typography>
            <IconButton size="small" onClick={() => go(1)} sx={{ color: '#fff' }}>
                <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
        </Box>
    );
};

export default PrototypeSwitcher;
