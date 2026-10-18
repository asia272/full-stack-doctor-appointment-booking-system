import { TopDoctors } from '@/components/doctors/top-doctors'
import Hero from '@/components/home/Hero'
import { Navbar } from '@/components/layout/navbar'


import React from 'react'

const page = () => {
  return (
    <>
      <Hero />
      <TopDoctors />
    </>
  )
}

export default page