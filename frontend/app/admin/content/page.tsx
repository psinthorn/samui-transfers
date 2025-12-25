'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface PageContent {
  id: string;
  slug: string;
  title_en: string;
  title_th: string;
  description_en?: string;
  description_th?: string;
  content_en: string;
  content_th: string;
  contentType: string;
  status: string;
  category: string;
  featured: boolean;
  featuredImage?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const CONTENT_TYPES = ['page', 'faq', 'about', 'blog', 'policy'];
const CATEGORIES = ['general', 'policy', 'guides', 'info'];
const STATUSES = ['draft', 'published', 'archived'];

export default function ContentManagementPage() {
  const { lang } = useLanguage();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_th: '',
    description_en: '',
    description_th: '',
    content_en: '',
    content_th: '',
    contentType: 'page',
    status: 'draft',
    category: 'general',
    featuredImage: '',
  });

  // Fetch pages
  useEffect(() => {
    fetchPages();
  }, [filterStatus, filterType]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('contentType', filterType);

      const response = await fetch(`/api/admin/content?${params}`);
      if (!response.ok) throw new Error('Failed to fetch pages');

      const data = await response.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError(lang === 'en' ? 'Failed to load pages' : 'ไม่สามารถโหลดหน้าเพจ');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title_en: '',
      title_th: '',
      description_en: '',
      description_th: '',
      content_en: '',
      content_th: '',
      contentType: 'page',
      status: 'draft',
      category: 'general',
      featuredImage: '',
    });
    setSelectedPage(null);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const method = selectedPage ? 'PATCH' : 'POST';
      const url = '/api/admin/content';
      const body = selectedPage ? { ...formData, id: selectedPage.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save page');
      }

      setSuccess(
        lang === 'en'
          ? `Page ${selectedPage ? 'updated' : 'created'} successfully`
          : `หน้าเพจ${selectedPage ? 'อัปเดต' : 'สร้าง'}สำเร็จ`
      );

      resetForm();
      setActiveTab('list');
      await fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page');
    }
  };

  const handleEdit = (page: PageContent) => {
    setSelectedPage(page);
    setFormData({
      slug: page.slug,
      title_en: page.title_en,
      title_th: page.title_th,
      description_en: page.description_en || '',
      description_th: page.description_th || '',
      content_en: page.content_en,
      content_th: page.content_th,
      contentType: page.contentType,
      status: page.status,
      category: page.category,
      featuredImage: page.featuredImage || '',
    });
    setActiveTab('form');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'en' ? 'Delete this page?' : 'ลบหน้าเพจนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      setSuccess(lang === 'en' ? 'Page deleted successfully' : 'ลบหน้าเพจสำเร็จ');
      await fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      archived: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const labels = {
    en: {
      title: 'Content Management',
      allPages: 'All Pages',
      createNew: 'Create New Page',
      editPage: 'Edit Page',
      pagesList: 'Pages List',
      filters: 'Filters',
      contentType: 'Content Type',
      status: 'Status',
      slug: 'Page Slug',
      titleEn: 'Title (English)',
      titleTh: 'Title (Thai)',
      descriptionEn: 'Description (English)',
      descriptionTh: 'Description (Thai)',
      contentEn: 'Content (English)',
      contentTh: 'Content (Thai)',
      featuredImage: 'Featured Image URL',
      category: 'Category',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      createdAt: 'Created',
      updatedAt: 'Updated',
      noPages: 'No pages found',
    },
    th: {
      title: 'จัดการเนื้อหา',
      allPages: 'หน้าเพจทั้งหมด',
      createNew: 'สร้างหน้าเพจใหม่',
      editPage: 'แก้ไขหน้าเพจ',
      pagesList: 'รายชื่อหน้าเพจ',
      filters: 'ตัวกรอง',
      contentType: 'ประเภทเนื้อหา',
      status: 'สถานะ',
      slug: 'ชื่อเพจ URL',
      titleEn: 'ชื่อเรื่อง (อังกฤษ)',
      titleTh: 'ชื่อเรื่อง (ไทย)',
      descriptionEn: 'คำอธิบาย (อังกฤษ)',
      descriptionTh: 'คำอธิบาย (ไทย)',
      contentEn: 'เนื้อหา (อังกฤษ)',
      contentTh: 'เนื้อหา (ไทย)',
      featuredImage: 'URL ภาพเด่น',
      category: 'หมวดหมู่',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      edit: 'แก้ไข',
      delete: 'ลบ',
      createdAt: 'สร้างเมื่อ',
      updatedAt: 'อัปเดตเมื่อ',
      noPages: 'ไม่พบหน้าเพจ',
    },
  };

  const t = labels[lang as keyof typeof labels] || labels.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📝 {t.title}</h1>
          <p className="text-slate-400">
            {lang === 'en' ? 'Manage website pages and content' : 'จัดการหน้าเพจและเนื้อหาเว็บไซต์'}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          <button
            onClick={() => { setActiveTab('list'); resetForm(); }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'list'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📄 {t.pagesList}
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'form'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ➕ {selectedPage ? t.editPage : t.createNew}
          </button>
        </div>

        {/* List View */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-slate-800 p-4 rounded-lg flex gap-4">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 text-sm"
              >
                <option value="">{t.status}</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 text-sm"
              >
                <option value="">{t.contentType}</option>
                {CONTENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Pages Table */}
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                {lang === 'en' ? 'Loading...' : 'กำลังโหลด...'}
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8 text-slate-400">{t.noPages}</div>
            ) : (
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700 border-b border-slate-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Slug</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">{lang === 'en' ? 'Title' : 'ชื่อเรื่อง'}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">{t.contentType}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">{t.status}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">{lang === 'en' ? 'Actions' : 'ดำเนินการ'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {pages.map(page => (
                      <tr key={page.id} className="hover:bg-slate-700/50 transition">
                        <td className="px-6 py-3 text-sm text-slate-300">{page.slug}</td>
                        <td className="px-6 py-3 text-sm text-slate-300">{lang === 'en' ? page.title_en : page.title_th}</td>
                        <td className="px-6 py-3 text-sm text-slate-300">{page.contentType}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${getStatusBadge(page.status)}`}>
                            {page.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm flex gap-2">
                          <button
                            onClick={() => handleEdit(page)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition text-xs"
                          >
                            {t.delete}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Form View */}
        {activeTab === 'form' && (
          <div className="bg-slate-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">{t.slug} *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  disabled={!!selectedPage}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded disabled:opacity-50"
                  placeholder="about-us"
                />
              </div>

              {/* Content Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">{t.contentType}</label>
                  <select
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                  >
                    {CONTENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">{t.status}</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* English Section */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">🇬🇧 English</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t.titleEn} *</label>
                    <input
                      type="text"
                      name="title_en"
                      value={formData.title_en}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t.descriptionEn}</label>
                    <input
                      type="text"
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t.contentEn} *</label>
                    <textarea
                      name="content_en"
                      value={formData.content_en}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Thai Section */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">🇹🇭 ไทย</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t.titleTh} *</label>
                    <input
                      type="text"
                      name="title_th"
                      value={formData.title_th}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t.descriptionTh}</label>
                    <input
                      type="text"
                      name="description_th"
                      value={formData.description_th}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">{t.contentTh} *</label>
                    <textarea
                      name="content_th"
                      value={formData.content_th}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
                >
                  {t.save}
                </button>
                <button
                  type="button"
                  onClick={() => { resetForm(); setActiveTab('list'); }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold transition"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
