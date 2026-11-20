import React, { useState, useEffect } from 'react'
import { 
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Grid, Typography, Box, FormControl, FormHelperText, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material'
import { useSession } from 'next-auth/react'

const OTHER_SUPERVISOR_OPTION = '__other_supervisor__'
const NO_EMAIL_FACULTY_PREFIX = '__faculty_without_email__:'
const MAX_LECTURER_PHOTO_SIZE = 1024 * 1024
const selectedFacultyLabel = (value, faculties) => {
    if (value.startsWith(NO_EMAIL_FACULTY_PREFIX)) return value.slice(NO_EMAIL_FACULTY_PREFIX.length)
    const faculty = faculties.find((item) => item.email === value)
    return faculty ? `${faculty.name} (${faculty.email})` : value
}
const SEMINAR_TYPES = [
    'Ph.D. Viva Voce Examination',
    'Ph.D. Pre-Synopsis Open Seminar'
]

export const AddForm = ({ handleClose, open, refresh }) => {
    const { data: session } = useSession()
    const [submitting, setSubmitting] = useState(false)
    const [faculties, setFaculties] = useState([])
    const [loadingFaculties, setLoadingFaculties] = useState(false)
    const [facultyError, setFacultyError] = useState('')
    const [supervisorIsOther, setSupervisorIsOther] = useState(false)
    const [coSupervisorIsOther, setCoSupervisorIsOther] = useState(false)
    const [supervisorNeedsEmail, setSupervisorNeedsEmail] = useState(false)
    const [coSupervisorNeedsEmail, setCoSupervisorNeedsEmail] = useState(false)
    
    const [content, setContent] = useState({
        seminar_type: '',
        lecturer_name: '',
        description: '',
        supervisor_email: '',
        supervisor_other: '',
        supervisor_other_email: '',
        co_supervisor_email: '',
        co_supervisor_other: '',
        co_supervisor_other_email: '',
        venue: '',
        date: '',
        time: '',
        abstract: '',
    })

    const [photoFile, setPhotoFile] = useState(null)
    const [photoError, setPhotoError] = useState('')

    useEffect(() => {
        if (open) {
            setContent({
                seminar_type: '',
                lecturer_name: '',
                description: '',
                supervisor_email: '',
                supervisor_other: '',
                supervisor_other_email: '',
                co_supervisor_email: '',
                co_supervisor_other: '',
                co_supervisor_other_email: '',
                venue: '',
                date: '',
                time: '',
                abstract: '',
            })
            setPhotoFile(null)
            setPhotoError('')
            setSupervisorIsOther(false)
            setCoSupervisorIsOther(false)
            setSupervisorNeedsEmail(false)
            setCoSupervisorNeedsEmail(false)
            fetchFaculties()
        }
    }, [open])

    const fetchFaculties = async () => {
        setLoadingFaculties(true)
        setFacultyError('')
        try {
            const res = await fetch('/api/faculty?type=basic&role=FACULTY')
            if (!res.ok) throw new Error('Failed to load faculty')
            const data = await res.json()
            if (!Array.isArray(data.data)) throw new Error('Invalid faculty response')
            setFaculties(data.data)
        } catch (error) {
            setFaculties([])
            setFacultyError('Unable to load faculty. Close and reopen this form to retry.')
            console.error('Error fetching faculties:', error)
        } finally {
            setLoadingFaculties(false)
        }
    }

    const handleChange = (e) => {
        setContent({ ...content, [e.target.name]: e.target.value })
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0] || null
        if (file && file.size > MAX_LECTURER_PHOTO_SIZE) {
            e.target.value = ''
            setPhotoFile(null)
            setPhotoError('Lecturer photo must be 1 MB or smaller.')
            return
        }
        setPhotoError('')
        setPhotoFile(file)
    }

    const handleSupervisorSelection = (emailField, otherField, otherEmailField) => (e) => {
        const value = e.target.value
        const isOther = value === OTHER_SUPERVISOR_OPTION
        const missingEmailFaculty = value.startsWith(NO_EMAIL_FACULTY_PREFIX)
        const facultyName = missingEmailFaculty ? value.slice(NO_EMAIL_FACULTY_PREFIX.length) : ''
        if (emailField === 'supervisor_email') {
            setSupervisorIsOther(isOther)
            setSupervisorNeedsEmail(missingEmailFaculty)
        }
        if (emailField === 'co_supervisor_email') {
            setCoSupervisorIsOther(isOther)
            setCoSupervisorNeedsEmail(missingEmailFaculty)
        }
        setContent((current) => ({
            ...current,
            [emailField]: isOther || missingEmailFaculty ? '' : value,
            [otherField]: missingEmailFaculty ? facultyName : isOther ? current[otherField] : '',
            [otherEmailField]: isOther || missingEmailFaculty ? current[otherEmailField] : ''
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (photoFile && photoFile.size > MAX_LECTURER_PHOTO_SIZE) {
            setPhotoError('Lecturer photo must be 1 MB or smaller.')
            return
        }
        setSubmitting(true)

        try {
            let lecturer_photo = null
            if (photoFile) {
                let fileData = new FormData()
                fileData.append('file', photoFile)
                fileData.append('fileType', 'profile')
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: fileData,
                })
                if (response.ok) {
                    const data = await response.json()
                    lecturer_photo = data.url
                } else {
                    throw new Error('Image upload failed')
                }
            }

            const finaldata = {
                id: Date.now(),
                ...content,
                date: content.date ? new Date(content.date).getTime() : null,
                lecturer_photo
            }

            const result = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: finaldata,
                    type: "phd_seminar"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to create PhD seminar')
            }

            if (refresh) refresh()
            handleClose()
        } catch (error) {
            console.error('Error creating PhD seminar:', error)
            alert('Failed to create PhD seminar. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ backgroundColor: '#830001', color: 'white', fontWeight: 600 }}>
                    Create New PhD Seminar
                </DialogTitle>
                <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel id="seminar-type-label">Type of Seminar</InputLabel>
                                <Select labelId="seminar-type-label" name="seminar_type" value={content.seminar_type} onChange={handleChange} label="Type of Seminar">
                                    {SEMINAR_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Scholar Name" name="lecturer_name" required value={content.lecturer_name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary' }}>Lecturer Photo (Max 1MB)</Typography>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handlePhotoChange}
                                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                {photoError && <Typography variant="caption" color="error">{photoError}</Typography>}
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" name="description" multiline rows={3} value={content.description} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={Boolean(facultyError)} disabled={loadingFaculties}>
                                <InputLabel id="supervisor-label">Supervisor (Faculty)</InputLabel>
                                <Select
                                    labelId="supervisor-label"
                                    value={supervisorIsOther ? OTHER_SUPERVISOR_OPTION : supervisorNeedsEmail ? `${NO_EMAIL_FACULTY_PREFIX}${content.supervisor_other}` : content.supervisor_email}
                                    renderValue={(value) => selectedFacultyLabel(value, faculties)}
                                    onChange={handleSupervisorSelection('supervisor_email', 'supervisor_other', 'supervisor_other_email')}
                                    label="Supervisor (Faculty)"
                                    required
                                >
                                    <MenuItem value=""><em>Select a supervisor</em></MenuItem>
                                    {loadingFaculties ? (
                                        <MenuItem disabled><CircularProgress size={20} /> Loading...</MenuItem>
                                    ) : (
                                        faculties.map((faculty, index) => (
                                            <MenuItem key={faculty.email || `no-email-${faculty.name}-${index}`} value={faculty.email || `${NO_EMAIL_FACULTY_PREFIX}${faculty.name}`}>
                                                {faculty.name} ({faculty.email || 'no email'})
                                            </MenuItem>
                                        ))
                                    )}
                                    <MenuItem value={OTHER_SUPERVISOR_OPTION}>Other</MenuItem>
                                </Select>
                                {facultyError && <FormHelperText>{facultyError}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {supervisorIsOther && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField fullWidth required label="Supervisor (Other)" name="supervisor_other" value={content.supervisor_other} onChange={handleChange} />
                                    <TextField fullWidth required type="email" label="Supervisor Email" name="supervisor_other_email" value={content.supervisor_other_email} onChange={handleChange} />
                                </Box>
                            )}
                            {supervisorNeedsEmail && <TextField fullWidth required type="email" label={`Supervisor Email for ${content.supervisor_other}`} name="supervisor_other_email" value={content.supervisor_other_email} onChange={handleChange} />}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={Boolean(facultyError)} disabled={loadingFaculties}>
                                <InputLabel id="co-supervisor-label">Co-supervisor (optional)</InputLabel>
                                <Select
                                    labelId="co-supervisor-label"
                                    value={coSupervisorIsOther ? OTHER_SUPERVISOR_OPTION : coSupervisorNeedsEmail ? `${NO_EMAIL_FACULTY_PREFIX}${content.co_supervisor_other}` : content.co_supervisor_email}
                                    renderValue={(value) => selectedFacultyLabel(value, faculties)}
                                    onChange={handleSupervisorSelection('co_supervisor_email', 'co_supervisor_other', 'co_supervisor_other_email')}
                                    label="Co-supervisor (optional)"
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {!loadingFaculties && faculties.map((faculty, index) => (
                                        <MenuItem key={faculty.email || `no-email-${faculty.name}-${index}`} value={faculty.email || `${NO_EMAIL_FACULTY_PREFIX}${faculty.name}`}>{faculty.name} ({faculty.email || 'no email'})</MenuItem>
                                    ))}
                                    <MenuItem value={OTHER_SUPERVISOR_OPTION}>Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {coSupervisorIsOther && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField fullWidth required label="Co-supervisor (Other)" name="co_supervisor_other" value={content.co_supervisor_other} onChange={handleChange} />
                                    <TextField fullWidth required type="email" label="Co-supervisor Email" name="co_supervisor_other_email" value={content.co_supervisor_other_email} onChange={handleChange} />
                                </Box>
                            )}
                            {coSupervisorNeedsEmail && <TextField fullWidth required type="email" label={`Co-supervisor Email for ${content.co_supervisor_other}`} name="co_supervisor_other_email" value={content.co_supervisor_other_email} onChange={handleChange} />}
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Venue" name="venue" value={content.venue} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="date" label="Date" name="date" InputLabelProps={{ shrink: true }} value={content.date} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="time" label="Time" name="time" InputLabelProps={{ shrink: true }} value={content.time} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth label="Abstract" name="abstract" multiline rows={4} value={content.abstract} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ color: '#666', borderColor: '#ccc' }} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#830001', '&:hover': { backgroundColor: '#9a0000' }}} disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create PhD Seminar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
