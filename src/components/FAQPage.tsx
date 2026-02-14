import React from 'react';
import { FAQSection } from './FAQSection';

export const FAQPage: React.FC = () => {
  return (
    <div className="faq-page">
      <div className="faq-header">
        <h2>📋 FAQ</h2>
        <p>Everything you need to know about using the parking dashboard</p>
      </div>

      <FAQSection title="For Renters" emoji="🚗">
        <div className="faq-item">
          <div className="faq-question">How do I rent a parking spot?</div>
          <div className="faq-answer">
            <ol>
              <li>Browse available spots on the dashboard</li>
              <li>Click <strong>"Rent This Spot"</strong> on the listing you want</li>
              <li>Select your rental dates and times</li>
              <li>Send payment via Venmo to the owner's handle shown</li>
              <li>Upload a screenshot of your Venmo payment</li>
              <li>Enter your contact information and confirm</li>
              <li>You'll receive the spot number and owner's contact info</li>
            </ol>
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">How is pricing calculated?</div>
          <div className="faq-answer">
            Pricing is calculated per day. Any partial day counts as a full day. For example, 8 hours = 1 day, 25 hours = 2 days, 48 hours = 2 days.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">What if I have issues with the spot?</div>
          <div className="faq-answer">
            Contact the spot owner directly using the phone number provided in your confirmation. The owner's contact info is also sent to your email.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Why do I need to upload a Venmo screenshot?</div>
          <div className="faq-answer">
            The screenshot serves as proof of payment and helps protect both renters and owners. It's stored securely and only accessible to building management if needed for dispute resolution.
          </div>
        </div>
      </FAQSection>

      <FAQSection title="For Spot Owners" emoji="🅿️">
        <div className="faq-item">
          <div className="faq-question">How do I list my parking spot?</div>
          <div className="faq-answer">
            <ol>
              <li>Click <strong>"+ List Your Spot"</strong> in the header</li>
              <li>Enter your Venmo handle, email, and phone number</li>
              <li>Enter your parking spot number, size, and floor</li>
              <li>Optionally add a note (e.g., "Near elevator", "Covered spot")</li>
              <li>Set your availability dates and times</li>
              <li>Set your price per day</li>
              <li>Create a 4-digit PIN (you'll need this to edit or delete your listing)</li>
              <li>Click "List My Spot"</li>
            </ol>
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">How do I find my listing?</div>
          <div className="faq-answer">
            Use the "Search by Venmo" filter on the dashboard and enter your Venmo handle. Your listing(s) will appear in the results. Spot numbers are not searchable to protect owner privacy.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">How do I edit or delete my listing?</div>
          <div className="faq-answer">
            Click <strong>"Edit / Delete Listing"</strong> on your spot card, then enter your 4-digit PIN. From there you can update any details or remove the listing entirely.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">What happens when someone rents my spot?</div>
          <div className="faq-answer">
            You'll receive an email notification with the renter's details. If they only rent part of your available period, the remaining time will automatically become a new listing. Payment is sent directly to your Venmo - no platform fees!
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">I forgot my PIN. What do I do?</div>
          <div className="faq-answer">
            Please contact Vishnu to help with recovery.
          </div>
        </div>
      </FAQSection>

      <FAQSection title="Times & Scheduling" emoji="⏰">
        <div className="faq-item">
          <div className="faq-question">What timezone are the times in?</div>
          <div className="faq-answer">
            All times are displayed in <strong>Pacific Standard Time (PST)</strong>, which is the timezone of the building. This ensures consistency regardless of where you're viewing the dashboard from.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Can I list my spot for specific hours?</div>
          <div className="faq-answer">
            Yes! When creating a listing, you can specify exact start and end times. For example, you could list your spot from 9 AM to 5 PM on weekdays if you only use it evenings and weekends.
          </div>
        </div>
      </FAQSection>

      <FAQSection title="Payments" emoji="💳">
        <div className="faq-item">
          <div className="faq-question">How do payments work?</div>
          <div className="faq-answer">
            Payments are made directly between renters and owners via Venmo. The dashboard does not process any payments - it simply facilitates the connection.
          </div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Are there any fees?</div>
          <div className="faq-answer">
            No! This is a free service for building residents. Owners receive 100% of the rental price they set.
          </div>
        </div>
      </FAQSection>

      <FAQSection title="Other Questions" emoji="❓">
        <div className="faq-item">
          <div className="faq-question">Why are the listings in random order?</div>
          <div className="faq-answer">
            Listings are randomly sorted by default to ensure fairness - no single spot gets priority over another. You can change the sort order using the "Sort by" dropdown to view by soonest available or longest duration if you prefer.
          </div>
        </div>
      </FAQSection>
    </div>
  );
};
