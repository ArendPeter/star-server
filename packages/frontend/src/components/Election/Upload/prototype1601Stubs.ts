// PROTOTYPE (wayfinder ticket #1601) — throwaway, do not use in production code.
//
// Shared mock data + fake async "upload" for the three UploadBallots dialog UX
// variants. Stands in for the not-yet-implemented ballotUploadCSV/JSON parsers
// (#1598/#1600), the closed-election online/upload dry-run (#1599), and
// uploadBallotsBatched (#1600) — none of that real wiring exists yet.

export type StubRowStatus = 'pending' | 'ready' | 'skip_online' | 'unknown_voter' | 'uploaded' | 'failed';

export type StubBallotRow = {
    voter_id: string;
    status: StubRowStatus;
    message: string;
};

// A stand-in for what ballotUploadCSV/JSON + the #1599 roll dry-run would produce
// after parsing a file and cross-referencing the closed election's roll: most rows
// are fine, two already voted online (would be skipped per #1599), one voter_id
// doesn't match any roll entry (a per-row reject per #1598).
export const makeStubParsedRows = (): StubBallotRow[] => ([
    { voter_id: 'voter-001', status: 'ready', message: '' },
    { voter_id: 'voter-002', status: 'ready', message: '' },
    { voter_id: 'voter-003', status: 'skip_online', message: 'Already voted online' },
    { voter_id: 'voter-004', status: 'skip_online', message: 'Already voted online' },
    { voter_id: 'voter-005', status: 'ready', message: '' },
    { voter_id: 'unknown-voter-009', status: 'unknown_voter', message: 'voter_id not found on roll' },
]);

export const countByStatus = (rows: StubBallotRow[]) => ({
    ready: rows.filter(r => r.status === 'ready').length,
    skip_online: rows.filter(r => r.status === 'skip_online').length,
    unknown_voter: rows.filter(r => r.status === 'unknown_voter').length,
});

// Stands in for uploadBallotsBatched(...)'s onProgress-driven batching (#1600).
// Advances one row per tick so the caller can render a live progress bar +
// per-row status flips exactly like the real thing would.
export function fakeUploadBallots(
    rows: StubBallotRow[],
    onProgress: (state: { uploaded: number; total: number; failed: number; rows: StubBallotRow[] }) => void,
): () => void {
    const working = rows.map(r => ({ ...r }));
    const total = working.filter(r => r.status !== 'skip_online').length; // skipped rows are filtered out before the real submit, per #1599
    let uploaded = 0;
    let failed = 0;
    let cancelled = false;

    const tick = (i: number) => {
        if (cancelled) return;
        if (i >= working.length) return;
        const row = working[i];
        if (row.status === 'skip_online') {
            tick(i + 1);
            return;
        }
        if (row.status === 'unknown_voter') {
            row.status = 'failed';
            failed++;
        } else {
            row.status = 'uploaded';
        }
        uploaded++;
        onProgress({ uploaded, total, failed, rows: [...working] });
        setTimeout(() => tick(i + 1), 350);
    };
    setTimeout(() => tick(0), 350);

    return () => { cancelled = true; };
}
