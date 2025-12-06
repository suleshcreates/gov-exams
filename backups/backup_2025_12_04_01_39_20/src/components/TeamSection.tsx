import { motion } from "framer-motion";
import { Users, Award, Heart, Target } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  expertise: string[];
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    role: "Founder & Chief Educator",
    description: "15+ years of experience in DMLT education with a passion for making quality education accessible to all students.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    expertise: ["Clinical Pathology", "Microbiology", "Biochemistry"]
  },
  {
    id: 2,
    name: "Prof. Priya Sharma",
    role: "Head of Curriculum",
    description: "Expert in developing comprehensive DMLT curricula with focus on practical knowledge and exam preparation.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    expertise: ["Hematology", "Immunology", "Quality Control"]
  },
  {
    id: 3,
    name: "Mr. Amit Patel",
    role: "Senior Faculty",
    description: "Specialized in making complex medical concepts simple and engaging for students through innovative teaching methods.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    expertise: ["Anatomy", "Physiology", "Medical Ethics"]
  },
  {
    id: 4,
    name: "Dr. Sneha Desai",
    role: "Lab Coordinator",
    description: "Brings real-world laboratory experience to classroom teaching, ensuring students are industry-ready.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    expertise: ["Lab Management", "Diagnostic Techniques", "Safety Protocols"]
  }
];

export const TeamSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6"
          >
            <Users className="w-6 h-6 text-primary" />
            <span className="text-sm font-bold text-primary">Meet Our Team</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            Expert <span className="gradient-text">Educators</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our dedicated team of experienced professionals is committed to your success in DMLT education
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                {/* Image */}
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-4">{member.description}</p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Excellence</h3>
            <p className="text-sm text-muted-foreground">
              Committed to delivering the highest quality education and support
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Passion</h3>
            <p className="text-sm text-muted-foreground">
              Driven by genuine care for student success and growth
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Results</h3>
            <p className="text-sm text-muted-foreground">
              Focused on helping you achieve your DMLT career goals
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
