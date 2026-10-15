import { TopDoctors } from '@/components/doctors/top-doctors'
import { Navbar } from '@/components/layout/navbar'
import React from 'react'

const page = () => {
  return (
    <>
      <Navbar />
      <TopDoctors />
    </>
  )
}

export default page