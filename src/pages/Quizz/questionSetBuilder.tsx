import { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Type, Check, X, Upload, Trash2, Eye } from 'lucide-react';

interface Question {
  id: number;
  question_text: string | null;
  question_image_url: string | null;
  question_type: 'text' | 'image';
  options?: Array<{
    id: number;
    option_text: string;
    is_correct: boolean;
  }>;
}

interface Option {
  option_text: string;
  is_correct: boolean;
}

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export default function QuestionSetBuilder({ questionSetId }: { questionSetId: number }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'text' as 'text' | 'image',
    question_image: null as File | null,
  });

  const [options, setOptions] = useState<Option[]>([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [questionSetId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/quiz/set/${questionSetId}/questions`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError('Failed to fetch questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('question_set_id', questionSetId.toString());
    formData.append('question_text', questionForm.question_text);
    formData.append('question_type', questionForm.question_type);

    if (questionForm.question_image) {
      formData.append('question_image', questionForm.question_image);
    }

    try {
      const response = await fetch(`${API_URL}/api/quiz/question`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Question created successfully!');
        setSelectedQuestionId(data.question.id);
        setShowQuestionModal(false);
        setShowOptionsModal(true);
        setQuestionForm({ question_text: '', question_type: 'text', question_image: null });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to create question');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const handleAddOptions = async () => {
    if (!selectedQuestionId) return;

    const validOptions = options.filter(opt => opt.option_text.trim() !== '');
    const hasCorrect = validOptions.some(opt => opt.is_correct);

    if (validOptions.length < 2) {
      setError('Add at least 2 options');
      return;
    }

    if (!hasCorrect) {
      setError('Mark at least one option as correct');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/quiz/question/${selectedQuestionId}/options`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: validOptions }),
      });

      if (response.ok) {
        setSuccess('Options added successfully!');
        setShowOptionsModal(false);
        setOptions([
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ]);
        setSelectedQuestionId(null);
        fetchQuestions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add options');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const addOptionField = () => {
    setOptions([...options, { option_text: '', is_correct: false }]);
  };

  const removeOptionField = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Question Builder
              </h1>
              <p className="text-slate-600">Add questions and options to your quiz</p>
            </div>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-slideDown">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-slideDown">
            {success}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2 w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Type className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No questions yet</h3>
            <p className="text-slate-500 mb-6">Add your first question to get started</p>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {question.question_type === 'text' ? (
                          <Type className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-medium text-slate-500 uppercase">
                          {question.question_type} Question
                        </span>
                      </div>
                      {question.question_text && (
                        <p className="text-lg font-medium text-slate-800 mb-3">
                          {question.question_text}
                        </p>
                      )}
                      {question.question_image_url && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                          <img
                            src={`${API_URL}/uploads/${question.question_image_url}`}
                            alt="Question"
                            className="w-full max-w-md h-auto"
                          />
                        </div>
                      )}
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {question.options.map((option, idx) => (
                            <div
                              key={option.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                option.is_correct
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  option.is_correct
                                    ? 'bg-green-500'
                                    : 'bg-slate-300'
                                }`}
                              >
                                {option.is_correct && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <span
                                className={`flex-1 ${
                                  option.is_correct ? 'text-green-900 font-medium' : 'text-slate-700'
                                }`}
                              >
                                {option.option_text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Question</h2>

            <form onSubmit={handleCreateQuestion} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Question Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestionForm({ ...questionForm, question_type: 'text' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      questionForm.question_type === 'text'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Type className="w-5 h-5" />
                    Text Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionForm({ ...questionForm, question_type: 'image' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      questionForm.question_type === 'image'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                    Image Question
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Question Text {questionForm.question_type === 'image' && '(Optional)'}
                </label>
                <textarea
                  value={questionForm.question_text}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, question_text: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                  placeholder="Enter your question here..."
                  rows={4}
                  required={questionForm.question_type === 'text'}
                />
              </div>

              {questionForm.question_type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Image
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setQuestionForm({ ...questionForm, question_image: file });
                      }}
                      className="hidden"
                      id="question-image"
                    />
                    <label htmlFor="question-image" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-600 font-medium">
                        {questionForm.question_image
                          ? questionForm.question_image.name
                          : 'Click to upload image'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setQuestionForm({ question_text: '', question_type: 'text', question_image: null });
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  Next: Add Options
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOptionsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Answer Options</h2>

            <div className="space-y-4 mb-6">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => updateOption(index, 'is_correct', !option.is_correct)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      option.is_correct
                        ? 'bg-green-500 border-green-600 text-white'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(index)}
                      className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addOptionField}
              className="w-full px-4 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all mb-6"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Another Option
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOptionsModal(false);
                  setOptions([
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                  ]);
                  setSelectedQuestionId(null);
                  setError('');
                }}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOptions}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                Save Options
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
