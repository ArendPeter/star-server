// PROTOTYPE (wayfinder ticket #1601) — throwaway, do not use in production code.
//
// Variant A — "Stacked dialog off Manage Voters"
// Entry point: a new "Upload Ballots" button next to the real "Add Voters"
// button on the Manage Voters page (mocked here, not actually edited into
// ViewElectionRolls.tsx). Dialog layout mirrors AddElectionRoll.tsx exactly —
// manual paste textarea stacked above a single "Select File" button, no
// toggle between the two. The online/upload conflict confirmation (#1599)
// is a single auto-triggered useConfirm() popup immediately after parsing,
// before the admin sees any table — matching AddElectionRoll's own
// duplicate-email confirm pattern.
import { useState } from 'react';
import {
    Box, Container, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, LinearProgress, TextField, Typography,
} from '@mui/material';
import { PrimaryButton, SecondaryButton } from '~/components/styles';
import EnhancedTable from '~/components/EnhancedTable';
import useConfirm from '~/components/ConfirmationDialogProvider';
import PermissionHandler from '~/components/PermissionHandler';
import { countByStatus, fakeUploadBallots, makeStubParsedRows, StubBallotRow } from './prototype1601Stubs';

const UploadBallotsDialogA = ({ onClose }: { onClose: () => void }) => {
    const confirm = useConfirm();
    const [pastedText, setPastedText] = useState('');
    const [rows, setRows] = useState<StubBallotRow[] | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ uploaded: 0, total: 0, failed: 0 });

    // Stands in for ballotUploadCSV/ballotUploadJSON (#1598/#1600) + the closed-election
    // roll dry-run (#1599) — both collapse into "parse the file, get back statused rows".
    const parseAndDryRun = async () => {
        const parsed = makeStubParsedRows();
        const counts = countByStatus(parsed);
        if (counts.skip_online > 0) {
            const confirmed = await confirm({
                title: 'Some ballots will be skipped',
                message: `${counts.skip_online} of ${parsed.length} ballot entries will be skipped because they have already voted online. Would you like to continue?`,
                submit: 'Continue',
                cancel: 'Cancel',
            });
            if (!confirmed) return;
        }
        setRows(parsed);
    };

    const doUpload = () => {
        setUploading(true);
        fakeUploadBallots(rows!, (state) => {
            setProgress(state);
            setRows(state.rows);
        });
    };

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
                            <PrimaryButton fullWidth disabled={!pastedText.trim()} onClick={() => parseAndDryRun()}>
                                Submit
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
                                <SecondaryButton fullWidth onClick={() => parseAndDryRun()}>
                                    <Typography variant="h6" component="h6">Select File</Typography>
                                </SecondaryButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>}

                {rows && <Box sx={{ mt: 1 }}>
                    {uploading && <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                            Uploading {progress.uploaded}/{progress.total} ({progress.failed} failed)...
                        </Typography>
                        <LinearProgress variant="determinate" value={progress.total ? (progress.uploaded / progress.total) * 100 : 0} />
                    </Box>}
                    <EnhancedTable
                        headKeys={['voter_id', 'upload_status', 'message']}
                        data={rows.map(r => ({ voter_id: r.voter_id, upload_status: statusLabel(r.status), message: r.message }))}
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
                {rows && !uploading && <PrimaryButton onClick={doUpload}>Upload {rows.filter(r => r.status === 'ready').length} Ballots</PrimaryButton>}
                <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            </DialogActions>
        </>
    );
};

const statusLabel = (s: StubBallotRow['status']) => ({
    pending: 'Pending', ready: 'Pending', skip_online: 'Error', unknown_voter: 'Error',
    uploaded: 'Done', failed: 'Error',
}[s]);

// Mock of the real Manage Voters page toolbar (ViewElectionRolls.tsx) with a new
// button added next to the existing "Add Voters" button.
const VariantA = () => {
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
                <UploadBallotsDialogA onClose={() => setOpen(false)} />
            </Dialog>
        </Box>
    );
};

export default VariantA;
