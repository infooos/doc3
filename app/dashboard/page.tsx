'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from 'lucide-react'

//import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, LogOut, User } from 'lucide-react';

// Define the interface for user case
interface UserCase {
  case_code: string;
  cases: { description: string }[];
  process_schedules: { id: string; process_name: string; actions: { name: string }[] }[];
}

// Define the type for selectedAction
interface Action {
  name: string;
  case_code: string; // Add other properties as needed
  process_id: string; // Ensure this matches your actual structure
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
    };

    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const [userCases, setUserCases] = useState<UserCase[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserCases();
    }
  }, [user]);

  const fetchUserCases = async () => {
    if (!user) return; // Guard clause to ensure user is defined
    const { data, error } = await supabase
      .from('user_cases')
      .select(`
        case_code,
        cases (description),
        process_schedules (
          id,
          process_name,
          actions
        )
      `)
     // .eq('user_id', user.id) // Use the user's ID from the state

    if (error) {
      console.error('Error fetching user cases:', error)
    } else {
      setUserCases(data as UserCase[]) // Cast data to UserCase[]
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedAction) return

    const filePath = `${selectedAction?.case_code}/${selectedAction?.process_id}/${selectedAction?.name}/${file.name}`
    const { error } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading file:', error)
    } else {
      alert('File uploaded successfully!')
      setSelectedAction(null)
      setFile(null)
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-semibold">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You're successfully logged in to your dashboard.
                </p>
              </CardContent>
            </Card>
            <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Your Cases and Upload Actions</CardTitle>
        <CardDescription>View your assigned cases and required upload actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case Code</TableHead>
              <TableHead>Case Description</TableHead>
              <TableHead>Process Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userCases.map((userCase) => (
              userCase.process_schedules.map((schedule) => (
//                <TableRow key={`${userCase.case_code}-${schedule.id}`}>
                <TableRow key={`${userCase.case_code}`}>
                  <TableCell>{userCase.case_code}</TableCell>
                  <TableCell>{userCase.cases[0]?.description}</TableCell>
                  <TableCell>{userCase.process_schedules[0]?.process_name}</TableCell>
                  <TableCell>
                    {schedule.actions.map((action) => (
                      <Dialog key={schedule.id}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2 mb-2"
                            onClick={() => setSelectedAction({
                              name: action.name,
                              case_code: userCase.case_code,
                              process_id: schedule.id
                            })}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {action.name}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload File for {action.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="file">Select File</Label>
                              <Input id="file" type="file" onChange={handleFileChange} />
                            </div>
                            <Button onClick={handleUpload} disabled={!file}>
                              Upload
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
            {/* Add more dashboard cards and content here */}
          </div>
        </div>
      </main>
    </div>
  );
}