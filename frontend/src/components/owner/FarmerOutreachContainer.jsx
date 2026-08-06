import React, { useState } from 'react';
import OutreachHeader from './OutreachHeader';
import OutreachKPICards from './OutreachKPICards';
import OutreachForm from './OutreachForm';
import OutreachLogbookDrawer from './OutreachLogbookDrawer';

export default function FarmerOutreachContainer() {
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);

  // Sample data for KPI metrics
  const metrics = {
    programs: '27 Sessions',
    reached: '1,245 Farmers',
    conversion: '34.8%',
    sales: '₹1.28 Lakhs'
  };

  // Sample data for historical logs
  const [logbookEntries, setLogbookEntries] = useState([
    {
      id: 1,
      title: 'Product Demonstration - Green Valley',
      date: '24 May 2024',
      description: 'Demonstration of Organic NPK fertilizer application techniques and soil health boost.',
      tags: ['Soil Health', 'Organic Fertilizers'],
      attended: 68,
      existing: 50,
      newLeads: 18,
      status: 'Completed'
    },
    {
      id: 2,
      title: 'Farmer Training Session - Karamadai',
      date: '22 May 2024',
      description: 'Interactive session on high-yield dairy cattle nutrition and silage preservation.',
      tags: ['Dairy Farming', 'Nutrition'],
      attended: 45,
      existing: 33,
      newLeads: 12,
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Awareness Programme - Thudiyalur',
      date: '18 May 2024',
      description: 'Awareness drive on government subsidies for micro-irrigation systems.',
      tags: ['Awareness', 'Irrigation'],
      attended: 90,
      existing: 60,
      newLeads: 30,
      status: 'Completed'
    }
  ]);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <OutreachHeader 
        activeDate="6 Aug 2026, Thu"
        logCount={logbookEntries.length}
        onOpenDrawer={() => setIsLogbookOpen(true)}
      />

      <OutreachKPICards metrics={metrics} />

      <OutreachForm />

      <OutreachLogbookDrawer 
        isOpen={isLogbookOpen}
        onClose={() => setIsLogbookOpen(false)}
        sessions={logbookEntries}
      />
    </div>
  );
}