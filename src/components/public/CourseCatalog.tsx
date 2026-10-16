import React, { useState } from 'react';
import { Search, Filter, Clock, BookOpen, Star, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

interface CourseCatalogProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse }) => {
  const { courses } = useCourse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [onlyFree, setOnlyFree] = useState<boolean>(false);

  const categories = ['all', 'Cybersecurity', 'Cloud Engineering', 'Governance & Compliance'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced', 'Executive'];

  const filteredCourses = courses.filter(course => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = 
        course.title.toLowerCase().includes(q) ||
        course.subtitle.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
    if (selectedLevel !== 'all' && course.level !== selectedLevel) return false;
    if (onlyFree && !course.isFree) return false;
    return true;
  });

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Enterprise Course Catalog</h1>
        <p className="text-slate-600 text-sm mt-1">
          Peer-reviewed, standards-compliant curricula for professional engineers, architects, and compliance officers.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, technology, compliance framework (e.g. Zero Trust, Kubernetes, NIST)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyFree(!onlyFree)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyFree 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${onlyFree ? 'opacity-100' : 'opacity-0'}`} />
              <span>Free Courses Only</span>
            </button>
          </div>
        </div>

        {/* Category & Level Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer capitalize ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Level:</span>
            {levels.map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer capitalize ${
                  selectedLevel === lvl 
                    ? 'bg-indigo-600 text-white font-semibold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredCourses.length} active enterprise courses</span>
        {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || onlyFree) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setOnlyFree(false);
            }}
            className="text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
          >
            <div className="relative h-44 overflow-hidden bg-slate-900">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                  {course.category}
                </span>
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                  v{course.activeVersion}
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="text-xs font-bold bg-white text-slate-900 px-2 py-1 rounded-md shadow">
                  {course.isFree ? 'Free' : `$${course.price}`}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{course.level}</span>
                  <span>•</span>
                  <span>{course.estimatedHours} hrs</span>
                  <span>•</span>
                  <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                    ★ {course.rating} ({course.reviewCount})
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {course.subtitle}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {course.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-[11px] font-medium text-slate-700 truncate max-w-[120px]">
                    {course.instructorName}
                  </span>
                </div>
                <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
