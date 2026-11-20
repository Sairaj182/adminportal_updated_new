import React, { useState } from 'react'
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    Typography
} from '@mui/material'
import {
    CalendarMonth as CalendarMonthIcon,
    Close as CloseIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    LocationOn as LocationOnIcon
} from '@mui/icons-material'

const formatDate = (value) => {
    const timestamp = Number(value)
    if (!Number.isFinite(timestamp) || timestamp <= 0) return ''

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(timestamp))
}

const supervisor = (seminar, type) => {
    if (type === 'supervisor') {
        return {
            email: seminar.supervisor_email || seminar.supervisor_other_email || '',
            name: seminar.supervisor_other || seminar.supervisor_name || seminar.supervisor_email || ''
        }
    }

    return {
        email: seminar.co_supervisor_email || seminar.co_supervisor_other_email || '',
        name: seminar.co_supervisor_other || seminar.co_supervisor_name || seminar.co_supervisor_email || ''
    }
}

export const PhDSeminarPreview = ({ open, handleClose, seminar }) => {
    const [abstractExpanded, setAbstractExpanded] = useState(false)
    const [imageUnavailable, setImageUnavailable] = useState(false)

    if (!seminar) return null

    const date = formatDate(seminar.date)
    const time = seminar.time?.trim()
    const venue = seminar.venue?.trim()
    const supervisorContact = supervisor(seminar, 'supervisor')
    const coSupervisorContact = supervisor(seminar, 'co-supervisor')

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
        >
            <DialogContent sx={{ p: { xs: 1, sm: 2 }, overflow: 'visible' }}>
                <Box
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        border: '1px solid #e5e7eb',
                        borderRadius: 3,
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                        minHeight: 420,
                        p: 3,
                        position: 'relative'
                    }}
                >
                    <IconButton
                        aria-label="Close preview"
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 12, top: 12, color: '#6b7280' }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ alignItems: 'center', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
                        <Avatar
                            alt={seminar.lecturer_name || 'Lecturer'}
                            src={imageUnavailable ? undefined : seminar.lecturer_photo || undefined}
                            imgProps={{ onError: () => setImageUnavailable(true) }}
                            sx={{ border: '4px solid rgba(153, 27, 27, 0.1)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)', height: 128, width: 128 }}
                        >
                            {seminar.lecturer_name?.charAt(0)?.toUpperCase() || 'L'}
                        </Avatar>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ color: '#991b1b', fontSize: { xs: '1.05rem', sm: '1.25rem' }, fontWeight: 700 }}>
                                {seminar.lecturer_name}
                            </Typography>
                            {supervisorContact.name && <Typography sx={{ color: '#6b7280', fontSize: '0.75rem', mt: 1 }}>Supervisor: {supervisorContact.email ? <Box component="a" href={`mailto:${supervisorContact.email.trim()}`} sx={{ color: '#2563eb', textDecoration: 'none' }}>{supervisorContact.name}</Box> : supervisorContact.name}</Typography>}
                            {coSupervisorContact.name && <Typography sx={{ color: '#6b7280', fontSize: '0.75rem', mt: 0.5 }}>Co-supervisor: {coSupervisorContact.email ? <Box component="a" href={`mailto:${coSupervisorContact.email.trim()}`} sx={{ color: '#2563eb', textDecoration: 'none' }}>{coSupervisorContact.name}</Box> : coSupervisorContact.name}</Typography>}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 3 }}>
                        <Typography component="h2" sx={{ color: '#111827', fontWeight: 700, lineHeight: 1.25, mb: 1.5 }}>
                            {seminar.seminar_type}
                        </Typography>
                        {seminar.description && <Typography sx={{ color: '#374151', fontSize: '1rem', lineHeight: 1.6 }}>{seminar.description}</Typography>}

                        {(date || time || venue) && (
                            <Box sx={{ borderBottom: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: 2.5, mt: 3, pb: 2.5 }}>
                                {(date || time) && <Box sx={{ alignItems: 'center', color: '#1f2937', display: 'flex', fontSize: '0.875rem', fontWeight: 500, gap: 1 }}><CalendarMonthIcon sx={{ color: '#991b1b', fontSize: 20 }} />{date}{date && time ? ' at ' : ''}{time}</Box>}
                                {venue && <Box sx={{ alignItems: 'center', color: '#1f2937', display: 'flex', fontSize: '0.875rem', fontWeight: 500, gap: 1 }}><LocationOnIcon sx={{ color: '#991b1b', fontSize: 20 }} />{venue}</Box>}
                            </Box>
                        )}

                        {seminar.abstract && (
                            <Box sx={{ mt: 2.5 }}>
                                <Button
                                    endIcon={abstractExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    onClick={() => setAbstractExpanded((expanded) => !expanded)}
                                    sx={{ color: '#991b1b', fontWeight: 600, px: 0, textTransform: 'none' }}
                                >
                                    {abstractExpanded ? 'Hide Abstract' : 'Read Abstract'}
                                </Button>
                                {abstractExpanded && <Box sx={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 3, color: '#374151', lineHeight: 1.6, maxHeight: 250, mt: 1.5, overflowY: 'auto', p: 2.5, whiteSpace: 'pre-wrap' }}>{seminar.abstract}</Box>}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
