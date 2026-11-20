'use client'
import React from 'react'
import DisplayPhDSeminars from '../components/phd-seminars/display-phd-seminars'
import Layout from '../components/layout'
import { Container, Typography } from '@mui/material'

export default function PhDSeminarsPage() {
    return (
        <Layout>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#830001' }}>
                    PhD Seminars Management
                </Typography>
                <DisplayPhDSeminars />
            </Container>
        </Layout>
    )
}
