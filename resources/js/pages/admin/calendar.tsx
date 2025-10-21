import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: admin.dashboard().url,
    },
    // {
    //     title: 'Calendar',
    //     href: admin('calendar').url,
    // },
];

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

export default function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    // Initialize with some events
    setEvents([
      {
        id: "1",
        title: "Event Conf.",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Danger" },
      },
      {
        id: "2",
        title: "Meeting",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Success" },
      },
      {
        id: "3",
        title: "Workshop",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { calendar: "Primary" },
      },
    ]);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    setIsModalOpen(true);
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel },
              }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    setIsModalOpen(false);
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  const openModal = () => {
    resetModalFields();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetModalFields();
  };

  const renderEventContent = (eventInfo: any) => {
    const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
    return (
      <div
        className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
      >
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  // Color configuration for radio buttons
  const getColorClasses = (colorType: string, isSelected: boolean) => {
    const colorMap = {
      danger: {
        border: isSelected ? 'border-red-500' : 'border-red-300',
        bg: isSelected ? 'bg-red-500' : 'bg-red-50',
        hover: 'hover:border-red-400'
      },
      success: {
        border: isSelected ? 'border-green-500' : 'border-green-300',
        bg: isSelected ? 'bg-green-500' : 'bg-green-50',
        hover: 'hover:border-green-400'
      },
      primary: {
        border: isSelected ? 'border-blue-500' : 'border-blue-300',
        bg: isSelected ? 'bg-blue-500' : 'bg-blue-50',
        hover: 'hover:border-blue-400'
      },
      warning: {
        border: isSelected ? 'border-orange-500' : 'border-orange-300',
        bg: isSelected ? 'bg-orange-500' : 'bg-orange-50',
        hover: 'hover:border-orange-400'
      }
    };
    
    return colorMap[colorType as keyof typeof colorMap] || colorMap.primary;
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head>
        <title>Calendar</title>
        <meta name="description" content="Calendar page for managing events and schedules" />
      </Head>
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Add Event +",
                click: openModal,
              },
            }}
          />
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 lg:p-11 max-w-[700px] w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                  {selectedEvent ? "Edit Event" : "Add Event"}
                </h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                  Plan your next big moment: schedule or edit an event to stay on track
                </p>
              </div>
              
              <form className="flex flex-col">
                <div className="px-2 pb-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Event Title
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                      Event Color
                    </label>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                      {Object.entries(calendarsEvents).map(([key, value]) => {
                        const isSelected = eventLevel === key;
                        const colors = getColorClasses(value, isSelected);
                        
                        return (
                          <div key={key} className="flex items-center">
                            <label
                              className="flex items-center text-sm text-gray-700 dark:text-gray-400 cursor-pointer"
                              htmlFor={`modal${key}`}
                            >
                              <span className="relative mr-3">
                                <input
                                  className="sr-only"
                                  type="radio"
                                  name="event-level"
                                  value={key}
                                  id={`modal${key}`}
                                  checked={isSelected}
                                  onChange={() => setEventLevel(key)}
                                />
                                <span 
                                  className={`flex items-center justify-center w-5 h-5 border-2 rounded-full transition-all duration-200 ${colors.border} ${colors.bg} ${colors.hover}`}
                                >
                                  {isSelected && (
                                    <span className="h-2 w-2 rounded-full bg-white"></span>
                                  )}
                                </span>
                              </span>
                              <span className="font-medium">{key}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Enter Start Date
                    </label>
                    <div className="relative">
                      <input
                        id="event-start-date"
                        type="date"
                        value={eventStartDate}
                        onChange={(e) => setEventStartDate(e.target.value)}
                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Enter End Date
                    </label>
                    <div className="relative">
                      <input
                        id="event-end-date"
                        type="date"
                        value={eventEndDate}
                        onChange={(e) => setEventEndDate(e.target.value)}
                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <button
                    onClick={closeModal}
                    type="button"
                    className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddOrUpdateEvent}
                    type="button"
                    className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 sm:w-auto"
                  >
                    {selectedEvent ? "Update Changes" : "Add Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}