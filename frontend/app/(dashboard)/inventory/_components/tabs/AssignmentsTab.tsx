import { AssetAssignment } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';
import type { AssignmentsTabProps } from '../../_types';

export default function AssignmentsTab({ assignments }: AssignmentsTabProps) {
  const activeAssignments = assignments.filter(a => a.status === 'Active');
  const historyAssignments = assignments.filter(a => a.status === 'History');

  const AssignmentTable = ({ data }: { data: AssetAssignment[] }) => (
    <div className="border border-gray-200 rounded-md bg-white">
        <Table>
            <TableHeader>
                <TableRow className="border-gray-200">
                    <TableHead>Serial No</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Mount Date</TableHead>
                    <TableHead>Odometer (Mount)</TableHead>
                     <TableHead>Dismount Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((asg) => (
                    <TableRow key={asg.id} className="border-gray-200">
                        <TableCell className="font-mono text-sm font-medium">{asg.serialNumber || 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-gray-500" />
                                <span className="font-semibold">{asg.truckPlate}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-sm">{asg.position || 'N/A'}</TableCell>
                        <TableCell className="text-sm">{new Date(asg.mountDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm font-mono">{asg.mountOdometer.toLocaleString()} km</TableCell>
                         <TableCell className="text-sm font-mono text-gray-500">
                             {asg.dismountDate ? (
                                 <div className="flex flex-col">
                                     <span>{new Date(asg.dismountDate).toLocaleDateString()}</span>
                                     <span className="text-xs">({asg.dismountOdometer?.toLocaleString()} km)</span>
                                 </div>
                             ) : '-'}
                        </TableCell>
                    </TableRow>
                ))}
                 {data.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                             No assignments found.
                        </TableCell>
                     </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
  );

  return (
    <div className="space-y-6">
        <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader>
                <CardTitle>Active Assignments</CardTitle>
                <CardDescription>Assets currently mounted on trucks.</CardDescription>
            </CardHeader>
            <CardContent>
               <AssignmentTable data={activeAssignments} />
            </CardContent>
        </Card>

        {historyAssignments.length > 0 && (
             <Card className="border-gray-200 shadow-sm bg-white">
                <CardHeader>
                    <CardTitle>Assignment History</CardTitle>
                    <CardDescription>Past usage records.</CardDescription>
                </CardHeader>
                <CardContent>
                   <AssignmentTable data={historyAssignments} />
                </CardContent>
            </Card>
        )}
    </div>
  );
}
