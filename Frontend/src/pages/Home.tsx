import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Heart, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import { threadsApi } from '../services/api';
import { Thread, ThreadFilters } from '../types';
import CreateThreadModal from '../components/CreateThreadModal';
import ThreadCard from '../components/ThreadCard';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const [filters, setFilters] = useState<ThreadFilters>({
    page: 1,
    limit: 10,
    sort: 'newest'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: threadsData, isLoading, error } = useQuery(
    ['threads', filters],
    () => threadsApi.getThreads(filters),
    {
      keepPreviousData: true,
    }
  );

  const createThreadMutation = useMutation(
    (data: { title: string; content: string; topic: string }) =>
      threadsApi.createThread(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['threads']);
        setIsCreateModalOpen(false);
        
        if (response.moderation) {
          toast.success('Thread created but flagged for review');
        } else {
          toast.success('Thread created successfully!');
        }
      },
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || 'Failed to create thread';
        toast.error(message);
      },
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleSortChange = (sort: 'newest' | 'oldest' | 'popular') => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  };

  const handleTopicFilter = (topic: string) => {
    setFilters(prev => ({ ...prev, topic: topic || undefined, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const topics = ['general', 'technology', 'books', 'movies', 'music', 'sports', 'politics', 'science'];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load threads. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Threads</h1>
          <p className="text-gray-600 mt-1">Join the conversation</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search threads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </form>

          {/* Topic Filter */}
          <select
            value={filters.topic || ''}
            onChange={(e) => handleTopicFilter(e.target.value)}
            className="input"
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSortChange('newest')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                filters.sort === 'newest'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => handleSortChange('oldest')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                filters.sort === 'oldest'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Oldest</span>
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                filters.sort === 'popular'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Popular</span>
            </button>
          </div>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading threads...</p>
          </div>
        ) : threadsData?.items && threadsData.items.length > 0 ? (
          <>
            {threadsData.items.map((thread: Thread) => (
              <ThreadCard key={thread._id} thread={thread} />
            ))}

            {/* Pagination */}
            {threadsData.total > threadsData.limit && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {filters.page} of {Math.ceil(threadsData.total / threadsData.limit)}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page! >= Math.ceil(threadsData.total / threadsData.limit)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No threads found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.topic
                ? 'Try adjusting your search or filters'
                : 'Be the first to start a conversation!'}
            </p>
            {!filters.search && !filters.topic && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
              >
                Create First Thread
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      <CreateThreadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createThreadMutation.mutate}
        isLoading={createThreadMutation.isLoading}
      />
    </div>
  );
};

export default Home;
