import Container from '@mui/material/Container';
import ViewElectionRolls from "./ViewElectionRolls";
import { Routes, Route, useParams } from 'react-router-dom'
import EditRoles from './EditRoles';
import AdminHome from './AdminHome';
import WriteInApproval from './WriteInApproval';
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import Races from '~/components/ElectionForm/Races/Races';
import useElection from '~/components/ElectionContextProvider';
import TemporaryAccessWarning from '../TemporaryAccessWarning';
import ElectionSettings from './ElectionSettings';
import PublishAndShare from './PublishAndShare';
import Prototype1601UploadBallots from '../Upload/Prototype1601UploadBallots';

const AdminPage = ({title, children}: {title: string, children: ReactNode}) => {
    const {election} = useElection();
    return <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', display: "flex", justifyContent: "flex-start", alignItems: "flex-start", flexDirection: "column", gap: 4 }}>
        <Box sx={{ml: 0, mr: 'auto'}}>
            <Typography variant="h5">{`${election.title}`}</Typography>
            <Typography variant="h3">{`${title}`}</Typography>
            <TemporaryAccessWarning />
        </Box>
        {children}
    </Box>
}

const Admin = () => {
    const { id } = useParams();
    useElection();
    return (
        <Container>
            <Routes>
                <Route path='/' element={<AdminPage title='Admin Home'><AdminHome key={id}/></AdminPage>}/>
                <Route path='/build_ballot' element={<AdminPage title='Build Ballot'><Races/></AdminPage>}/>
                <Route path='/voters' element={<AdminPage title='Manage Voters'><ViewElectionRolls /></AdminPage>} />
                <Route path='/roles' element={<EditRoles />} />
                <Route path='/writeins/:raceId' element={<WriteInApproval />} />
                <Route path='/settings' element={<AdminPage title='Settings'><ElectionSettings/></AdminPage>} />
                <Route path='/publish' element={<AdminPage title='Publish & Share'><PublishAndShare/></AdminPage>} />
                {/* PROTOTYPE (wayfinder #1601) — throwaway route, remove once resolved */}
                <Route path='/prototype_upload_ballots' element={<AdminPage title='Upload Ballots (Prototype)'><Prototype1601UploadBallots/></AdminPage>} />
            </Routes>
        </Container>
    )
}

export default Admin
