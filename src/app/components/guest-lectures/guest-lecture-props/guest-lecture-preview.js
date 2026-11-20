import React, { useState } from 'react'
import {
    Avatar,
    Box,
    Button,
    Chip,
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

export const GuestLecturePreview = ({ open, handleClose, lecture }) => {
    const [biographyExpanded, setBiographyExpanded] = useState(false)
    const [imageUnavailable, setImageUnavailable] = useState(false)

    if (!lecture) return null

    const date = formatDate(lecture.date)
    const time = lecture.time?.trim()
    const venue = lecture.venue?.trim()

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
        >
            <DialogContent sx={{ p: { xs: 1, sm: 2 }, overflow: 'visible' }}>
                <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.92)', border: '1px solid #e5e7eb', borderRadius: 3, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)', minHeight: 420, p: 3, position: 'relative' }}>
                    <IconButton aria-label="Close preview" onClick={handleClose} sx={{ color: '#6b7280', position: 'absolute', right: 12, top: 12 }}>
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ alignItems: 'center', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
                        <Avatar
                            alt={lecture.lecturer_name || 'Lecturer'}
                            src={imageUnavailable ? undefined : lecture.lecturer_photo || undefined}
                            imgProps={{ onError: () => setImageUnavailable(true) }}
                            sx={{ border: '4px solid rgba(153, 27, 27, 0.1)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)', height: 128, width: 128 }}
                        >
                            {lecture.lecturer_name?.charAt(0)?.toUpperCase() || 'L'}
                        </Avatar>
                        <Box sx={{ textAlign: 'center' }}>
                            <Chip label={lecture.category || 'Institute Seminar'} size="small" sx={{ border: '1px solid #991b1b', color: '#991b1b', fontWeight: 600, mb: 1 }} variant="outlined" />
                            <Typography sx={{ color: '#991b1b', fontSize: { xs: '1.05rem', sm: '1.25rem' }, fontWeight: 700 }}>{lecture.lecturer_name}</Typography>
                            {lecture.lecturer_email && <Typography component="a" href={`mailto:${lecture.lecturer_email}`} sx={{ color: '#991b1b', display: 'block', fontSize: '0.75rem', mt: 0.5, textDecoration: 'underline' }}>{lecture.lecturer_email}</Typography>}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 3 }}>
                        <Typography component="h2" sx={{ color: '#111827', fontWeight: 700, lineHeight: 1.25 }}>{lecture.lecture_title}</Typography>
                        {(date || time || venue) && (
                            <Box sx={{ borderBottom: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: 2.5, mt: 3, pb: 2.5 }}>
                                {(date || time) && <Box sx={{ alignItems: 'center', color: '#1f2937', display: 'flex', fontSize: '0.875rem', fontWeight: 500, gap: 1 }}><CalendarMonthIcon sx={{ color: '#991b1b', fontSize: 20 }} />{date}{date && time ? ' | ' : ''}{time}</Box>}
                                {venue && <Box sx={{ alignItems: 'center', color: '#1f2937', display: 'flex', fontSize: '0.875rem', fontWeight: 500, gap: 1 }}><LocationOnIcon sx={{ color: '#991b1b', fontSize: 20 }} />Venue: {venue}</Box>}
                            </Box>
                        )}
                        {lecture.biography && (
                            <Box sx={{ mt: 2.5 }}>
                                <Button endIcon={biographyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={() => setBiographyExpanded((expanded) => !expanded)} sx={{ backgroundColor: '#991b1b', color: 'white', fontWeight: 600, px: 2, textTransform: 'none', '&:hover': { backgroundColor: '#7f1d1d' } }}>Biography</Button>
                                {biographyExpanded && <Box sx={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 3, color: '#374151', lineHeight: 1.6, maxHeight: 250, mt: 1.5, overflowY: 'auto', p: 2.5, whiteSpace: 'pre-wrap' }}>{lecture.biography}</Box>}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
