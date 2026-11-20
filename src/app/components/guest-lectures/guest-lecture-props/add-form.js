import React, { useState, useEffect } from 'react'
import { 
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField, Grid, Typography, FormControl, InputLabel, Select, MenuItem
} from '@mui/material'

const GUEST_LECTURE_CATEGORY = 'Institute Seminar'
const MAX_LECTURER_PHOTO_SIZE = 1024 * 1024

export const AddForm = ({ handleClose, open, refresh }) => {
    const [submitting, setSubmitting] = useState(false)
    
    const [content, setContent] = useState({
        lecture_title: '',
        lecturer_name: '',
        lecturer_email: '',
        category: GUEST_LECTURE_CATEGORY,
        venue: '',
        date: '',
        time: '',
        biography: '',
    })

    const [photoFile, setPhotoFile] = useState(null)
    const [photoError, setPhotoError] = useState('')

    useEffect(() => {
        if (open) {
            setContent({
                lecture_title: '',
                lecturer_name: '',
                lecturer_email: '',
                category: GUEST_LECTURE_CATEGORY,
                venue: '',
                date: '',
                time: '',
                biography: '',
            })
            setPhotoFile(null)
            setPhotoError('')
        }
    }, [open])

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
                    type: "guest_lecture"
                }),
            })

            if (!result.ok) {
                throw new Error('Failed to create guest lecture')
            }

            if (refresh) refresh()
            handleClose()
        } catch (error) {
            console.error('Error creating guest lecture:', error)
            alert('Failed to create guest lecture. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ backgroundColor: '#830001', color: 'white', fontWeight: 600 }}>
                    Create New Guest Lecture
                </DialogTitle>
                <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Lecture Title" name="lecture_title" required value={content.lecture_title} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Lecturer Name" name="lecturer_name" required value={content.lecturer_name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="email" label="Lecturer Email (Optional)" name="lecturer_email" value={content.lecturer_email} onChange={handleChange} />
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
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="guest-lecture-category-label">Lecture Category</InputLabel>
                                <Select labelId="guest-lecture-category-label" name="category" value={content.category} onChange={handleChange} label="Lecture Category">
                                    <MenuItem value={GUEST_LECTURE_CATEGORY}>{GUEST_LECTURE_CATEGORY}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Venue" name="venue" value={content.venue} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="date" label="Date" name="date" InputLabelProps={{ shrink: true }} value={content.date} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="time" label="Time" name="time" InputLabelProps={{ shrink: true }} value={content.time} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth label="Biography" name="biography" multiline rows={4} value={content.biography} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={handleClose} variant="outlined" sx={{ color: '#666', borderColor: '#ccc' }} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#830001', '&:hover': { backgroundColor: '#9a0000' }}} disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Guest Lecture'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
