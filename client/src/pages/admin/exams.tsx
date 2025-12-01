import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminExamsPage({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const { data: exams = [] } = useQuery({
    queryKey: [`/api/admin/courses/${courseId}/exams`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}/exams`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: questions = [] } = useQuery({
    queryKey: [`/api/admin/exams/${selectedExam}/questions`],
    queryFn: async () => {
      if (!selectedExam) return [];
      const res = await fetch(`/api/admin/exams/${selectedExam}/questions`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedExam,
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const res = await fetch(`/api/admin/exams/${examId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Exam deleted" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}/exams`] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Exams & Quizzes</h2>
        <ExamDialog courseId={courseId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Unit Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exams.filter((e: any) => e.type === "quiz").map((exam: any) => (
                <div key={exam.id} className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50" data-testid={`exam-card-${exam.id}`}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">{exam.totalQuestions} questions</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedExam(exam.id)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteExamMutation.mutate(exam.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Final Exam</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.filter((e: any) => e.type === "final").length > 0 ? (
              exams.filter((e: any) => e.type === "final").map((exam: any) => (
                <div key={exam.id} className="p-3 border rounded-lg" data-testid={`final-exam-${exam.id}`}>
                  <p className="font-semibold">{exam.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">{exam.totalQuestions} questions • {exam.passingScore}% pass score</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedExam(exam.id)}>
                      Edit Questions
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteExamMutation.mutate(exam.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No final exam created</p>
                <ExamDialog courseId={courseId} type="final" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.map((q: any, idx: number) => (
                <div key={q.id} className="p-3 border rounded-lg" data-testid={`question-${idx}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{idx + 1}. {q.questionText}</p>
                      <div className="mt-2 space-y-1 text-xs">
                        {q.options?.map((opt: string, oidx: number) => (
                          <p key={oidx} className={q.correctAnswer === oidx ? "text-green-600 font-semibold" : ""}>
                            {String.fromCharCode(65 + oidx)}) {opt}
                          </p>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        /* delete question */
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              <QuestionDialog examId={selectedExam} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExamDialog({ courseId, type = "quiz" }: { courseId: string; type?: "quiz" | "final" }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ title: "", totalQuestions: "20", passingScore: "70", type });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/courses/${courseId}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: data.title,
          type: data.type,
          totalQuestions: parseInt(data.totalQuestions),
          passingScore: parseInt(data.passingScore),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: `${type === "final" ? "Final exam" : "Quiz"} created` });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/courses/${courseId}/exams`] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {type === "final" ? "Create Final Exam" : "Add Quiz"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {type === "final" ? "Final Exam" : "Unit Quiz"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder={`Unit Quiz 1`} />
          </div>
          <div>
            <Label>Total Questions</Label>
            <Input type="number" value={data.totalQuestions} onChange={(e) => setData({ ...data, totalQuestions: e.target.value })} />
          </div>
          <div>
            <Label>Passing Score (%)</Label>
            <Input type="number" value={data.passingScore} onChange={(e) => setData({ ...data, passingScore: e.target.value })} max="100" />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuestionDialog({ examId }: { examId: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          questionText: data.questionText,
          options: [data.optionA, data.optionB, data.optionC, data.optionD],
          correctAnswer: ["A", "B", "C", "D"].indexOf(data.correctAnswer),
          explanation: data.explanation,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Question added" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/exams/${examId}/questions`] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <Label>Question</Label>
            <Textarea value={data.questionText} onChange={(e) => setData({ ...data, questionText: e.target.value })} placeholder="Enter question text" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["A", "B", "C", "D"].map((letter) => (
              <div key={letter}>
                <Label>Option {letter}</Label>
                <Input value={data[`option${letter}` as keyof typeof data] as string} onChange={(e) => setData({ ...data, [`option${letter}`]: e.target.value })} />
              </div>
            ))}
          </div>
          <div>
            <Label>Correct Answer</Label>
            <Select value={data.correctAnswer} onValueChange={(val) => setData({ ...data, correctAnswer: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["A", "B", "C", "D"].map((letter) => (
                  <SelectItem key={letter} value={letter}>
                    {letter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Explanation (Optional)</Label>
            <Textarea value={data.explanation} onChange={(e) => setData({ ...data, explanation: e.target.value })} placeholder="Why is this answer correct?" rows={2} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? "Adding..." : "Add Question"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
