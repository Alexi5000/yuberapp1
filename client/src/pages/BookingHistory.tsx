import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Repeat } from 'lucide-react';

interface BookingHistoryProps {
  onSelectBooking: (booking: any) => void;
  onRebook: (booking: any) => void;
  onBack: () => void;
}

export default function BookingHistory({ onSelectBooking, onRebook, onBack }: BookingHistoryProps) {
  const { data: bookings, isLoading } = trpc.booking.list.useQuery();

  const upcomingBookings = bookings?.filter(b => b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress') || [];

  const pastBookings = bookings?.filter(b => b.status === 'completed' || b.status === 'cancelled') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const BookingCard = ({ booking, showRebook = false }: { booking: any, showRebook?: boolean }) => (
    <Card
      className='cursor-pointer hover:shadow-md transition-shadow'
      onClick={() => onSelectBooking(booking)}>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div>
            <h3 className='font-semibold text-foreground capitalize'>{booking.serviceType}</h3>
            <p className='text-sm text-muted-foreground'>Booking #{booking.id}</p>
          </div>
          <Badge className={getStatusColor(booking.status)}>{booking.status.replace('_', ' ')}</Badge>
        </div>

        <div className='space-y-2 text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4' />
            <span>{formatDate(booking.createdAt)}</span>
          </div>
          {booking.scheduledAt && (
            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4' />
              <span>{formatTime(booking.scheduledAt)}</span>
            </div>
          )}
          {booking.locationAddress && (
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4' />
              <span className='truncate'>{booking.locationAddress}</span>
            </div>
          )}
        </div>

        {booking.estimatedCostMin && booking.estimatedCostMax && (
          <div className='mt-3 pt-3 border-t border-border'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Estimated</span>
              <span className='font-semibold text-foreground'>${booking.estimatedCostMin} - ${booking.estimatedCostMax}</span>
            </div>
          </div>
        )}

        {showRebook && (
          <div className='mt-3 pt-3 border-t border-border'>
            <Button
              variant='outline'
              size='sm'
              className='w-full'
              onClick={(e) => {
                e.stopPropagation();
                onRebook(booking);
              }}>
              <Repeat className='w-4 h-4 mr-2' />
              Book Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background border-b border-border'>
        <div className='flex items-center p-4'>
          <Button variant='ghost' size='icon' onClick={onBack} className='mr-3'>
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>Booking History</h1>
        </div>
      </div>

      <div className='p-4'>
        <Tabs defaultValue='upcoming' className='w-full'>
          <TabsList className='w-full mb-4'>
            <TabsTrigger value='upcoming' className='flex-1'>Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value='past' className='flex-1'>Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value='upcoming' className='space-y-3'>
            {isLoading ?
              (
                <div className='space-y-3'>
                  {[1, 2].map((i) => (
                    <Card key={i} className='animate-pulse'>
                      <CardContent className='p-4'>
                        <div className='h-4 bg-muted rounded w-3/4 mb-2' />
                        <div className='h-3 bg-muted rounded w-1/2' />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) :
              upcomingBookings.length > 0 ?
              (upcomingBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <BookingCard booking={booking} />
                </motion.div>
              ))) :
              (
                <div className='text-center py-12'>
                  <Calendar className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-foreground mb-2'>No upcoming bookings</h3>
                  <p className='text-muted-foreground'>Your scheduled services will appear here</p>
                </div>
              )}
          </TabsContent>

          <TabsContent value='past' className='space-y-3'>
            {isLoading ?
              (
                <div className='space-y-3'>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className='animate-pulse'>
                      <CardContent className='p-4'>
                        <div className='h-4 bg-muted rounded w-3/4 mb-2' />
                        <div className='h-3 bg-muted rounded w-1/2' />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) :
              pastBookings.length > 0 ?
              (pastBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <BookingCard booking={booking} showRebook={booking.status === 'completed'} />
                </motion.div>
              ))) :
              (
                <div className='text-center py-12'>
                  <Clock className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-foreground mb-2'>No past bookings</h3>
                  <p className='text-muted-foreground'>Your completed services will appear here</p>
                </div>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
