import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFAQs, addFAQ, deleteFAQ, getAnnouncements, addAnnouncement, deleteAnnouncement } from "@/lib/localDb";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Admin = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setFaqs(getFAQs());
    setAnnouncements(getAnnouncements());
    setLoading(false);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) {
      toast.error("Please fill in all required fields");
      return;
    }
    addFAQ({
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category || "General",
    });
    toast.success("FAQ added successfully");
    setNewFaq({ question: "", answer: "", category: "" });
    loadData();
  };

  const handleDeleteFaq = (id: string) => {
    deleteFAQ(id);
    toast.success("FAQ deleted successfully");
    loadData();
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill in all fields");
      return;
    }
    addAnnouncement({
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: 'medium'
    });
    toast.success("Announcement added successfully");
    setNewAnnouncement({ title: "", content: "" });
    loadData();
  };

  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncement(id);
    toast.success("Announcement deleted successfully");
    loadData();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Admin Dashboard</h1>
          <button 
            onClick={() => navigate("/chat")}
            className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-3 rounded-full font-medium transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,122,255,0.3)] hover:-translate-y-0.5"
          >
            Back to Chat
          </button>
        </div>

        <Tabs defaultValue="faqs" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-[#f5f5f7] p-1 rounded-lg">
            <TabsTrigger value="faqs" className="data-[state=active]:bg-white data-[state=active]:text-[#007AFF] font-medium">FAQs Management</TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-white data-[state=active]:text-[#007AFF] font-medium">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New FAQ</CardTitle>
                <CardDescription>Create a new frequently asked question</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFaq} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      placeholder="Enter the question"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      placeholder="Enter the answer"
                      required
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Input
                      id="category"
                      value={newFaq.category}
                      onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                      placeholder="e.g., Academics, Facilities"
                    />
                  </div>
                  <button type="submit" className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing FAQs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium">{faq.question}</TableCell>
                        <TableCell>{faq.category || "Uncategorized"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFaq(faq.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Announcement</CardTitle>
                <CardDescription>Create a new campus announcement</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ann-title">Title</Label>
                    <Input
                      id="ann-title"
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                      }
                      placeholder="Announcement title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-content">Content</Label>
                    <Textarea
                      id="ann-content"
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                      }
                      placeholder="Announcement content"
                      required
                      rows={4}
                    />
                  </div>
                  <button type="submit" className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Announcement
                  </button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((ann) => (
                      <TableRow key={ann.id}>
                        <TableCell className="font-medium">{ann.title}</TableCell>
                        <TableCell>
                          {new Date(ann.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
