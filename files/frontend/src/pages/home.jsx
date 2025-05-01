import React from 'react'
import Navbar from '../Components/Navbar/Navbar'
import Hero from '../Components/Hero/Hero'
import Title from '../Components/Title/Title'
import About from '../Components/About/About'
import Contact from '../Components/Contact/Contact'
import Footer from '../Components/Footer/Footer'
import How from '../Components/How/How'

const home = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <div className="container">
        <Title subTitle={" "} title='Key Features' />
        <How/>

        <Title subTitle={"Take a look at our work"} title='About' />
        <About/>
        <Title subTitle='Contact Us ' title='Get in Touch' />
        <Contact />
        <Footer />
        </div> 
    </div>
  )
}

export default home