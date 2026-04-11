import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdCalendarToday } from "react-icons/md";
import { studentAPI } from "../../api/student.jsx";
import { toast } from "react-hot-toast";
import Spinner from "../../components/shared/Spinner.jsx";

export function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      setIsLoading(true);
      try {
        const response = await studentAPI.getExams();
        const exams = response.exams || response.data || [];
        const currentExam = exams.find((e) => e.id.toString() === examId);

        if (!currentExam) {
          setNotFound(true);
        } else {
          setExam(currentExam);
        }
      } catch (error) {
        toast.error("Error fetching exam details.");
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (notFound || !exam) {
    return (
      <>
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Exam Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The exam you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/student/browse-exams")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Browse All Exams
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {exam.title}
          </h1>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-600">Subject</p>
              <p className="text-slate-900">{exam.subject}</p>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MdCalendarToday className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Posted:</span>
              <span>{new Date(exam.dateUploaded).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
