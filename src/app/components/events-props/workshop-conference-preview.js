import React from 'react'
import { Box, Dialog, DialogContent, IconButton, Link } from '@mui/material'
import { CalendarMonth as CalendarIcon, Close as CloseIcon, Download as DownloadIcon, LocationOn as LocationIcon, OpenInNew as ExternalLinkIcon } from '@mui/icons-material'

function parse(value) {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) } catch { return value }
}

function dateLabel(value) {
  if (!value) return ''
  const date = new Date(Number(value))
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '-')
}

function eventResources(event) {
  const attachments = parse(event.attachments)
  const resources = Array.isArray(attachments) ? [...attachments] : []
  if (event.doclink) resources.push({ url: event.doclink, caption: 'Event Registration', external: true })
  const link = parse(event.event_link)
  if (link) resources.push(typeof link === 'string' ? { url: link, caption: 'Event Link', external: true } : { ...link, external: true })
  return resources.filter(item => /^https?:\/\//i.test(item?.url?.trim()))
}

export function WorkshopConferencePreview({ open, handleClose, event }) {
  const start = dateLabel(event.eventStartDate)
  const end = dateLabel(event.eventEndDate)
  const dateText = [start, end].filter(Boolean).join(' - ')

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton aria-label="Close preview" onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </Box>
      <DialogContent sx={{ pt: 0, pb: 3 }}>
        <Box component="article" sx={{ border: '1px solid #e5e7eb', borderRadius: 2, backgroundColor: '#fff', p: 2, textAlign: 'left' }}>
          <Box component="p" sx={{ mb: 1, color: '#1f2937', fontSize: '0.875rem', fontWeight: 600 }}>{event.title}</Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dateText && <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, color: '#4b5563', fontSize: '0.875rem' }}><CalendarIcon sx={{ fontSize: 16, mt: '2px' }} /><span>{dateText}</span></Box>}
            {event.venue && <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, color: '#4b5563', fontSize: '0.875rem' }}><LocationIcon sx={{ fontSize: 16, mt: '2px' }} /><span>{event.venue}</span></Box>}
          </Box>
          {eventResources(event).map((item, index) => (
            <Link key={`${item.url}-${index}`} href={item.url.trim()} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', mt: 1, color: '#9333ea', fontSize: '0.875rem', textDecoration: 'none' }}>
              {item.external ? <ExternalLinkIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} /> : <DownloadIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />}
              {item.caption || 'Event Attachment'}
            </Link>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
