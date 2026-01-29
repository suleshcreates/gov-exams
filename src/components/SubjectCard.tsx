import { motion } from "framer-motion";
import {
    BookOpen,
    Clock,
    FileText,
    ArrowRight,
    Sparkles,
    GraduationCap,
    Building2,
    Train,
    Globe2,
    Shield,
    Stethoscope,
    Calculator
} from "lucide-react";
import { Link } from "react-router-dom";

interface SubjectCardProps {
    id: string;
    name: string;
    description?: string;
    index: number;
    questionSets?: number;
    mcqsPerSet?: number;
    timeMinutes?: number;
}

const subjectIcons: { [key: string]: React.ElementType } = {
    'special': Sparkles,
    'marathi': BookOpen,
    'railway': Train,
    'rrb': Train,
    'bank': Building2,
    'banking': Building2,
    'upsc': Globe2,
    'ssc': Shield,
    'cgl': Shield,
    'medical': Stethoscope,
    'dmlt': Stethoscope,
    'math': Calculator,
    'default': GraduationCap
};

const getSubjectIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(subjectIcons)) {
        if (lowerName.includes(key)) return icon;
    }
    return subjectIcons.default;
};

const SubjectCard = ({
    id,
    name,
    description,
    index,
    questionSets = 5,
    mcqsPerSet = 20,
    timeMinutes = 60
}: SubjectCardProps) => {
    const Icon = getSubjectIcon(name);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group h-full"
        >
            <Link to={`/exam/${id}`} className="block h-full">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative h-full bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 overflow-hidden"
                >
                    {/* Subtle Accent Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Header: Icon + Badge */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors duration-300">
                                    <Icon className="w-8 h-8 text-black group-hover:text-primary transition-colors duration-300" />
                                </div>
                                {/* Micro-dot decoration */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-white scale-0 group-hover:scale-100 transition-transform duration-300" />
                            </div>

                            {index < 3 && (
                                <div className="px-4 py-1.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    Popular
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="mb-8 flex-grow">
                            <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-primary transition-colors duration-300">
                                {name}
                            </h3>

                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                {description || 'Comprehensive practice material designed for effective preparation.'}
                            </p>
                        </div>

                        {/* Stats Row: Professional Minimalist */}
                        <div className="flex items-center gap-6 mb-8 py-4 border-y border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Sets</span>
                                <span className="text-lg font-bold text-black">{questionSets}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-gray-100" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">MCQs</span>
                                <span className="text-lg font-bold text-black">{mcqsPerSet}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-gray-100" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Mins</span>
                                <span className="text-lg font-bold text-black">{timeMinutes}</span>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="mt-auto flex items-center justify-between pointer-events-none">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-black group-hover:text-primary transition-colors duration-300">Start Learning</span>
                                <div className="w-8 h-[2.5px] bg-black group-hover:bg-primary group-hover:w-12 transition-all duration-300 rounded-full" />
                            </div>

                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg group-hover:bg-primary transition-colors duration-300">
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
};

export default SubjectCard;
