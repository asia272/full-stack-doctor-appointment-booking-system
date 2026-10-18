import { TopDoctors } from '@/components/doctors/top-doctors'
import Banner from '@/components/home/Banner'
import Hero from '@/components/home/Hero'
import SpecialityMenu from '@/components/home/SpecialityMenu'
import { Navbar } from '@/components/layout/navbar'


import React from 'react'

const page = () => {
  return (
    <>
      <Hero />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </>
  )
}

export default page