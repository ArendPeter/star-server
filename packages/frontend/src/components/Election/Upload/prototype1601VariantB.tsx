// PROTOTYPE (wayfinder ticket #1601) — throwaway, do not use in production code.
//
// Variant B — "Dedicated Ballots page, single table, no stepper" (v2, per
// user feedback on the first pass: keep B's entry point — a new Sidebar nav
// item + dedicated /admin/ballots page — but drop the stepper. The file-select
// screen gains Variant A's paste-textarea option. Preview and results now
// share ONE table: clicking "Preview" populates it with pre-upload status
// (Pending / Skipped / Error), then "Confirm & Upload" flips those same rows
// to their final status in place, live, instead of moving to a new screen.
import { useState } from 'react';
import {
    Box, Container, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, LinearProgress, TextField, Typography,
} from '@mui/material';
import { PrimaryButton, SecondaryButton } from '~/components/styles';
import EnhancedTable from '~/components/EnhancedTable';
import PermissionHandler from '~/components/PermissionHandler';
import { countByStatus, fakeUploadBallots, makeStubParsedRows, StubBallotRow } from './prototype1601Stubs';

// Pre-upload label (post-Preview, pre-Confirm) vs. post-upload label (after Confirm)
// share the same 'upload_status' column — only the label/message text changes in place.
const preUploadLabel = (s: StubBallotRow['status']) => ({
    pending: 'Pending', ready: 'Pending', skip_online: 'Skipped', unknown_voter: 'Error', uploaded: 'Done', failed: 'Error',
}[s]);
const preUploadMessage = (r: StubBallotRow) => ({
    pending: '', ready: 'Ready to upload', skip_online: 'Already voted online — will be skipped', unknown_voter: 'voter_id not found on roll', uploaded: r.message, failed: r.message,
}[r.status]);

const UploadBallotsDialogB = ({ onClose }: { onClose: () => void }) => {
    const [pastedText, setPastedText] = useState('');
    const [rows, setRows] = useState<StubBallotRow[] | null>(null);
    const [uploading, setUploading] = useState(false);
    const [done, setDone] = useState(false);
    const [progress, setProgress] = useState({ uploaded: 0, total: 0, failed: 0 });

    // Stands in for ballotUploadCSV/JSON + the closed-election roll dry-run (#1598-1600) —
    // both collapse into "parse the input, get back statused rows" for this preview.
    const preview = () => setRows(makeStubParsedRows());

    const confirmUpload = () => {
        setUploading(true);
        fakeUploadBallots(rows!, (state) => {
            setProgress(state);
            setRows(state.rows);
            if (state.uploaded >= state.total) setDone(true);
        });
    };

    const counts = rows ? countByStatus(rows) : null;

    return (
        <>
            <DialogTitle sx={{ m: 0 }}>Upload Ballots</DialogTitle>
            <DialogContent>
                {!rows && <Container maxWidth="sm">
                    <Grid container sx={{ flexDirection: 'column' }}>
                        <Typography align="center" gutterBottom variant="h6" component="h6">
                            Paste ballot data
                        </Typography>
                        <Typography align="center" component="p">
                            Paste CSV rows below — same columns as a ballot export, plus a voter_id column.
                        </Typography>
                        <Grid sx={{ p: 1 }}>
                            <TextField
                                label="Ballot Data" multiline rows={4} fullWidth
                                value={pastedText} onChange={e => setPastedText(e.target.value)}
                                placeholder="voter_id,precinct,President!!Alice,President!!Bob&#10;voter-001,12,1,2&#10;etc"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid sx={{ m: 1 }}>
                            <PrimaryButton fullWidth disabled={!pastedText.trim()} onClick={preview}>
                                Preview
                            </PrimaryButton>
                        </Grid>
                        <Grid sx={{ my: 1 }}><Divider /></Grid>
                        <Grid sx={{ m: 1 }}>
                            <Typography align="center" gutterBottom variant="h5" component="h5">OR</Typography>
                            <Typography align="center" gutterBottom variant="h6" component="h6">Upload File</Typography>
                            <Typography align="center" component="p">
                                Upload a .csv or .json file of ballot data. Must match this election&apos;s races and candidates.
                            </Typography>
                        </Grid>
                        <Grid sx={{ m: 1 }}>
                            <Box sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                {/* Selecting a file previews immediately — no separate button, mirroring AddElectionRoll */}
                                <SecondaryButton fullWidth onClick={preview}>
                                    <Typography variant="h6" component="h6">Select File</Typography>
                                </SecondaryButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>}

                {rows && counts && <Box sx={{ mt: 1 }}>
                    <Typography sx={{ mb: 2 }}>
                        {counts.ready} ready · {counts.skip_online} will be skipped (already voted online) · {counts.unknown_voter} unrecognized voter_id
                    </Typography>
                    {uploading && <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                            Uploading {progress.uploaded}/{progress.total} ({progress.failed} failed)...
                        </Typography>
                        <LinearProgress variant="determinate" value={progress.total ? (progress.uploaded / progress.total) * 100 : 0} />
                    </Box>}
                    <EnhancedTable
                        headKeys={['voter_id', 'upload_status', 'message']}
                        data={rows.map(r => ({
                            voter_id: r.voter_id,
                            upload_status: preUploadLabel(r.status),
                            message: preUploadMessage(r),
                        }))}
                        isPending={false}
                        pendingMessage=""
                        defaultSortBy="voter_id"
                        title="Ballots"
                        handleOnClick={() => {}}
                        emptyContent="No rows"
                    />
                </Box>}
            </DialogContent>
            <DialogActions>
                {rows && !uploading && !done && <PrimaryButton onClick={confirmUpload}>Confirm &amp; Upload {counts!.ready} Ballots</PrimaryButton>}
                <SecondaryButton onClick={onClose}>{done ? 'Done' : 'Close'}</SecondaryButton>
            </DialogActions>
        </>
    );
};

// Mock of the real Manage Voters page toolbar (ViewElectionRolls.tsx) with a new
// "Upload Ballots" button added next to the existing "Add Voters" button — same
// entry point as Variant A, now paired with this variant's dialog content.
const VariantB = () => {
    const [open, setOpen] = useState(false);
    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Mock of the Manage Voters page (/admin/voters) toolbar — entry point lives here, next to &quot;Add Voters&quot;.
            </Typography>
            <Box sx={{ p: 2, border: '1px dashed #999', borderRadius: 1 }}>
                <SecondaryButton sx={{ mr: 2 }}>Add Voters</SecondaryButton>
                <PermissionHandler permissions={['canUploadBallots']} requiredPermission="canUploadBallots">
                    <SecondaryButton onClick={() => setOpen(true)}>Upload Ballots</SecondaryButton>
                </PermissionHandler>
            </Box>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <UploadBallotsDialogB onClose={() => setOpen(false)} />
            </Dialog>
        </Box>
    );
};

export default VariantB;
