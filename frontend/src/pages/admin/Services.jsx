import React from 'react';
import { Plus, Edit2, Check } from 'lucide-react';
import './Services.css';

export default function AdminServices({
  services,
  editingServiceId,
  setEditingServiceId,
  editPriceInput,
  setEditPriceInput,
  newServiceName,
  setNewServiceName,
  newServicePrice,
  setNewServicePrice,
  newServiceDesc,
  setNewServiceDesc,
  handleSaveServicePrice,
  handleAddServiceSubmit
}) {
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Service Management</h3>
          <p>Manage cleaning categories, update descriptions, and adjust base rates.</p>
        </div>

        <div className="services-admin-grid">

          {/* list of existing services */}
          <div className="services-admin-list">
            <h4>Active Service Options</h4>
            <div className="admin-service-cards-stack">
              {services.map((service) => (
                <div key={service.id} className="admin-service-edit-card">
                  <div className="service-edit-main">
                    <h4>{service.name}</h4>
                    <p>{service.desc}</p>
                  </div>

                  <div className="service-edit-action">
                    {editingServiceId === service.id ? (
                      <div className="inline-edit-row">
                        <input
                          type="number"
                          value={editPriceInput}
                          onChange={(e) => setEditPriceInput(e.target.value)}
                          placeholder={service.price.toString()}
                          className="inline-price-input"
                        />
                        <button
                          onClick={() => handleSaveServicePrice(service.id)}
                          className="btn btn-primary btn-icon-only"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="price-display-row">
                        <strong>₹{service.price}</strong>
                        <button
                          onClick={() => { setEditingServiceId(service.id); setEditPriceInput(service.price.toString()); }}
                          className="btn-edit-price"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* add new service form */}
          <form onSubmit={handleAddServiceSubmit} className="admin-service-form-card">
            <h4>Add New Service</h4>
            <div className="form-input-box">
              <label>Service Category Name</label>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Enter New Service"
                required
                className="form-text-field"
              />
            </div>
            <div className="form-input-box">
              <label>Base Price (₹)</label>
              <input
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="Enter The Price"
                required
                className="form-text-field"
              />
            </div>
            <div className="form-input-box large-gap">
              <label>Service Description</label>
              <textarea
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                placeholder="describe the service..."
                rows="3"
                className="form-textarea-field"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary btn-full-width">
              <Plus size={16} />
              <span>Create Service Category</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
