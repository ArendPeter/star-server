// PROTOTYPE (wayfinder ticket #1601) — throwaway, do not use in production code.
//
// Variant C — "No dialog at all: inline panel off Admin Home"
// Entry point: a new task row on Admin Home (mocked here, matching its
// existing Section-with-divider pattern), linking straight to a full-width
// panel — no modal anywhere in this flow. Manual paste is a collapsed
// "Paste instead" toggle (off by default) rather than always-visible.
// Parsing + the online/upload dry-run (#1599) happen immediately on file
// drop and render straight into the table as row-level status chips — no
// auto-popup confirm, no separate review step. A persistent banner
// summarizes counts; "Upload" is enabled the moment rows are visible.
import { useState } from 'react';
import { Box, Divider, Grid, LinearProgress, Link as MuiLink, TextField, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { PrimaryButton, SecondaryButton } from '~/components/styles';
import EnhancedTable from '~/components/EnhancedTable';
import { countByStatus, fakeUploadBallots, makeStubParsedRows, StubBallotRow } from './prototype1601Stubs';

const UploadBallotsPanel = () => {
    const [showPaste, setShowPaste] = useState(false);
    const [pastedText, setPastedText] = useState('');
    const [rows, setRows] = useState<StubBallotRow[] | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ uploaded: 0, total: 0, failed: 0 });

    // Parsing + the roll dry-run (#1598-1600) happen together, immediately —
    // there's no separate "preview" gate before rows land in the table below.
    const parseAndDryRun = () => setRows(makeStubParsedRows());

    const startUpload = () => {
        setUploading(true);
        fakeUploadBallots(rows!, (state) => {
            setProgress(state);
            setRows(state.rows);
        });
    };

    const counts = rows ? countByStatus(rows) : null;

    return (
        <Box sx={{ width: '100%', maxWidth: 800 }}>
            {!rows && <>
                <Box
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); parseAndDryRun(); }}
                    sx={{ width: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px dashed rgb(112,112,112)' }}
                >
                    <UploadFileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    <Typography variant="h6" sx={{ mt: 1 }}>Drag and drop a .csv or .json file</Typography>
                    <SecondaryButton sx={{ mt: 1 }} onClick={parseAndDryRun}>Select File</SecondaryButton>
                </Box>
                <Typography align="center" sx={{ mt: 1 }}>
                    <MuiLink component="button" variant="body2" onClick={() => setShowPaste(s => !s)}>
                        {showPaste ? 'Hide manual paste' : 'Paste ballot data instead'}
                    </MuiLink>
                </Typography>
                {showPaste && <Grid sx={{ p: 1 }}>
                    <TextField
                        label="Ballot Data" multiline rows={3} fullWidth
                        value={pastedText} onChange={e => setPastedText(e.target.value)}
                        placeholder="voter_id,precinct,President!!Alice,President!!Bob&#10;voter-001,12,1,2&#10;etc"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <PrimaryButton sx={{ mt: 1 }} fullWidth disabled={!pastedText.trim()} onClick={parseAndDryRun}>
                        Submit
                    </PrimaryButton>
                </Grid>}
            </>}

            {rows && counts && <Box>
                <Box sx={{ p: 1.5, mb: 2, borderRadius: 1, backgroundColor: counts.skip_online || counts.unknown_voter ? '#fff8e1' : '#e8f5e9' }}>
                    <Typography variant="body2">
                        {counts.ready} ready to upload
                        {counts.skip_online > 0 && ` · ${counts.skip_online} will be skipped (already voted online)`}
                        {counts.unknown_voter > 0 && ` · ${counts.unknown_voter} unrecognized voter_id (will fail)`}
                    </Typography>
                </Box>
                {uploading && <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={progress.total ? (progress.uploaded / progress.total) * 100 : 0} />
                </Box>}
                <EnhancedTable
                    headKeys={['voter_id', 'upload_status', 'message']}
                    data={rows.map(r => ({
                        voter_id: r.voter_id,
                        upload_status: { pending: 'Pending', ready: 'Pending', skip_online: 'Pending', unknown_voter: 'Pending', uploaded: 'Done', failed: 'Error' }[r.status],
                        message: r.status === 'skip_online' ? 'Will skip — already voted online' : r.status === 'unknown_voter' ? 'Unrecognized voter_id — will fail' : r.message,
                    }))}
                    isPending={false}
                    pendingMessage=""
                    defaultSortBy="voter_id"
                    title="Ballots"
                    handleOnClick={() => {}}
                    emptyContent="No rows"
                />
                {!uploading && <PrimaryButton sx={{ mt: 2 }} onClick={startUpload}>Upload {counts.ready} Ballots</PrimaryButton>}
            </Box>}
        </Box>
    );
};

// Mock of Admin Home's existing Section-with-divider pattern (AdminHome.tsx),
// with a new task row added for this flow — and the resulting panel below it.
const VariantC = () => {
    const [showPanel, setShowPanel] = useState(false);
    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Mock of a new Admin Home task row — clicking it reveals the panel below inline (no modal, no separate page nav).
            </Typography>
            <Grid container sx={{ p: 1, alignItems: 'center' }}>
                <Grid size={8}>
                    <Typography variant="h6">Upload paper ballots</Typography>
                    <Typography variant="body2" color="text.secondary">Bulk-add ballots collected on paper.</Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'right' }}>
                    <SecondaryButton onClick={() => setShowPanel(s => !s)}>{showPanel ? 'Hide' : 'Upload Ballots'}</SecondaryButton>
                </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            {showPanel && <UploadBallotsPanel />}
        </Box>
    );
};

export default VariantC;
