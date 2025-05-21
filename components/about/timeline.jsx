"use client"

import { motion } from "framer-motion"

const Timeline = ({ events }) => {
  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#333] transform md:translate-x-px"></div>

      <div className="space-y-12">
        {events.map((event, index) => (
          <div key={index} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 md:left-1/2 top-0 w-5 h-5 bg-[#D4AF37] rounded-full transform -translate-x-1/2 md:-translate-x-2.5 z-10"></div>

              {/* Content */}
              <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12"}`}>
                <div className="bg-[#111] border border-[#333] p-6 ml-8 md:ml-0">
                  <div className="text-2xl font-bold gold-text mb-2">{event.year}</div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-beige">{event.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
