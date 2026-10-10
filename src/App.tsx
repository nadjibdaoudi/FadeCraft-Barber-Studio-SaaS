/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SalonProvider, useSalon } from './context/SalonContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BookingsView } from './components/BookingsView';
import { ClientsView } from './components/ClientsView';
import { AutomationsView } from './components/AutomationsView';
import { BarbersView } from './components/BarbersView';
import { InventoryView } from './components/InventoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { BillingView } from './components/BillingView';
import { SettingsView } from './components/SettingsView';
import { ChatbotAssistant } from './components/ChatbotAssistant';
import { ClientDetailModal } from './components/ClientDetailModal';
import { NewBookingModal } from './components/NewBookingModal';
import { NewClientModal } from './components/NewClientModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CommandPalette } from './components/CommandPalette';
import { NotificationToast } from './components/NotificationToast';
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ padding: 16, whiteSpace: 'pre-wrap', color: 'red' }}>
          {this.state.error.message}
          {'\n'}
          {this.state.error.stack}
        </pre>
      );
    }
    return this.props.children;
  }
}
const MainContent: React.FC = () => {
  const { activeTab } = useSalon();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'today':
      case 'bookings':
      case 'calendar':
        return <BookingsView />;
      case 'clients':
        return <ClientsView />;
      case 'billing':
        return <BillingView />;
      case 'reminders':
      case 'automations':
        return <AutomationsView />;
      case 'barbers':
        return <BarbersView />;
      case 'inventory':
        return <InventoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'assistant':
        return <ChatbotAssistant isEmbeddedView={true} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F5F7] overflow-hidden text-[#1E293B] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Fixed Left Sidebar matching image */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header />
        <main className="flex-1 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Overlays & Modals */}
      <ClientDetailModal />
      <NewBookingModal />
      <NewClientModal />
      <CheckoutModal />
      <ReceiptModal />
      <CommandPalette />
      <NotificationToast />

      {/* Floating AI Chatbot Assistant on all views */}
      {activeTab !== 'assistant' && <ChatbotAssistant isEmbeddedView={false} />}
    </div>
  );
};

export default function App() {
  return (
    <SalonProvider>
  <ErrorBoundary>
    <MainContent />
  </ErrorBoundary>
</SalonProvider>
  );
}
