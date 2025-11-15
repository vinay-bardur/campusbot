import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFAQs, addFAQ, updateFAQ, deleteFAQ } from '@/lib/supabaseAdmin';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

export const FAQManager = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: '' });

  const categories = ['Admissions', 'Faculty', 'Facilities', 'Academics', 'About', 'Contact'];

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    setIsLoading(true);
    const { data, error } = await getFAQs();
    if (error) {
      toast.error('Failed to load FAQs');
    } else {
      setFaqs(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer || !formData.category) {
      toast.error('Please fill all fields');
      return;
    }

    if (editingFAQ) {
      const { error } = await updateFAQ(editingFAQ.id, formData);
      if (error) {
        toast.error('Failed to update FAQ');
      } else {
        toast.success('FAQ updated successfully');
        loadFAQs();
        resetForm();
      }
    } else {
      const { error } = await addFAQ(formData.question, formData.answer, formData.category);
      if (error) {
        toast.error('Failed to add FAQ');
      } else {
        toast.success('FAQ added successfully');
        loadFAQs();
        resetForm();
      }
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({ question: faq.question, answer: faq.answer, category: faq.category });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      const { error } = await deleteFAQ(id);
      if (error) {
        toast.error('Failed to delete FAQ');
      } else {
        toast.success('FAQ deleted successfully');
        loadFAQs();
      }
    }
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '', category: '' });
    setEditingFAQ(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">FAQ Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => resetForm()}
              className="bg-[#007AFF] hover:bg-[#0051D5] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Answer</label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-[#007AFF] hover:bg-[#0051D5]">
                  {editingFAQ ? 'Update' : 'Add'} FAQ
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Question</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{faq.category}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-[#007AFF] hover:text-[#0051D5] p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {faqs.length === 0 && (
          <div className="text-center py-8 text-gray-500">No FAQs found</div>
        )}
      </div>
    </div>
  );
};