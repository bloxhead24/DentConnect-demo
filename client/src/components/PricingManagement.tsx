import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  DollarSign,
  FileText,
  AlertCircle
} from "lucide-react";

interface TreatmentPrice {
  id: string;
  name: string;
  category: "routine" | "urgent" | "cosmetic" | "specialist";
  priceRange: string;
  description: string;
  notes?: string;
}

export default function PricingManagement() {
  const [treatmentPrices, setTreatmentPrices] = useState<TreatmentPrice[]>([
    {
      id: "1",
      name: "Routine Cleaning",
      category: "routine",
      priceRange: "£50-£80",
      description: "Standard dental cleaning and examination",
      notes: "Price varies based on complexity and time required"
    },
    {
      id: "2",
      name: "Tooth Filling",
      category: "routine",
      priceRange: "£90-£200",
      description: "Composite or amalgam filling",
      notes: "Price depends on size and material choice"
    },
    {
      id: "3",
      name: "Root Canal Treatment",
      category: "urgent",
      priceRange: "£400-£800",
      description: "Complete root canal therapy",
      notes: "Complex cases may require additional appointments"
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTreatment, setNewTreatment] = useState<Partial<TreatmentPrice>>({
    name: "",
    category: "routine",
    priceRange: "",
    description: "",
    notes: ""
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string, updatedTreatment: TreatmentPrice) => {
    setTreatmentPrices(prev => 
      prev.map(treatment => 
        treatment.id === id ? updatedTreatment : treatment
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setTreatmentPrices(prev => prev.filter(treatment => treatment.id !== id));
  };

  const handleAddTreatment = () => {
    if (newTreatment.name && newTreatment.priceRange) {
      const treatment: TreatmentPrice = {
        id: Date.now().toString(),
        name: newTreatment.name!,
        category: newTreatment.category as "routine" | "urgent" | "cosmetic" | "specialist",
        priceRange: newTreatment.priceRange!,
        description: newTreatment.description || "",
        notes: newTreatment.notes || ""
      };
      setTreatmentPrices(prev => [...prev, treatment]);
      setNewTreatment({
        name: "",
        category: "routine",
        priceRange: "",
        description: "",
        notes: ""
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "routine": return "bg-blue-100 text-blue-800";
      case "urgent": return "bg-orange-100 text-orange-800";
      case "cosmetic": return "bg-purple-100 text-purple-800";
      case "specialist": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Appointment Fee Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-900">Simple Appointment Booking</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Appointment Booking Fee: £5</strong></p>
                <p>This covers the convenience of instant booking through DentConnect.</p>
                <p>Treatment costs are assessed and quoted during your appointment based on your specific needs.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Price Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Treatment Price Guide</CardTitle>
              <CardDescription>
                Provide price ranges for common treatments to help patients understand costs
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
              Optional Price Guidance
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Important Notice */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-1 text-sm text-amber-800">
                  <p><strong>Price Guide Only:</strong> These ranges help patients understand typical costs.</p>
                  <p>Final prices are determined during consultation based on individual assessment.</p>
                  <p>Actual treatment costs may vary depending on complexity and patient needs.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Treatment */}
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-lg">Add Treatment Price Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treatmentName">Treatment Name</Label>
                  <Input
                    id="treatmentName"
                    value={newTreatment.name}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Dental Crown"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newTreatment.category}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="cosmetic">Cosmetic</option>
                    <option value="specialist">Specialist</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="priceRange">Price Range</Label>
                  <Input
                    id="priceRange"
                    value={newTreatment.priceRange}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, priceRange: e.target.value }))}
                    placeholder="e.g., £300-£600"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTreatment.description}
                    onChange={(e) => setNewTreatment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief treatment description"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newTreatment.notes}
                  onChange={(e) => setNewTreatment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any factors that might affect pricing..."
                  rows={2}
                />
              </div>
              <Button onClick={handleAddTreatment} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment Price Range
              </Button>
            </CardContent>
          </Card>

          {/* Treatment List */}
          <div className="space-y-3">
            {treatmentPrices.map((treatment) => (
              <Card key={treatment.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  {editingId === treatment.id ? (
                    <EditTreatmentForm
                      treatment={treatment}
                      onSave={(updated) => handleSave(treatment.id, updated)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{treatment.name}</h4>
                          <Badge className={getCategoryColor(treatment.category)}>
                            {treatment.category}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{treatment.priceRange}</p>
                        <p className="text-sm text-gray-600">{treatment.description}</p>
                        {treatment.notes && (
                          <p className="text-xs text-gray-500 italic">{treatment.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(treatment.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(treatment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface EditTreatmentFormProps {
  treatment: TreatmentPrice;
  onSave: (treatment: TreatmentPrice) => void;
  onCancel: () => void;
}

function EditTreatmentForm({ treatment, onSave, onCancel }: EditTreatmentFormProps) {
  const [editedTreatment, setEditedTreatment] = useState<TreatmentPrice>(treatment);

  const handleSave = () => {
    onSave(editedTreatment);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editName">Treatment Name</Label>
          <Input
            id="editName"
            value={editedTreatment.name}
            onChange={(e) => setEditedTreatment(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="editCategory">Category</Label>
          <select
            id="editCategory"
            value={editedTreatment.category}
            onChange={(e) => setEditedTreatment(prev => ({ ...prev, category: e.target.value as any }))}
            className="w-full h-10 px-3 border border-gray-300 rounded-md"
          >
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="cosmetic">Cosmetic</option>
            <option value="specialist">Specialist</option>
          </select>
        </div>
        <div>
          <Label htmlFor="editPrice">Price Range</Label>
          <Input
            id="editPrice"
            value={editedTreatment.priceRange}
            onChange={(e) => setEditedTreatment(prev => ({ ...prev, priceRange: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="editDescription">Description</Label>
          <Input
            id="editDescription"
            value={editedTreatment.description}
            onChange={(e) => setEditedTreatment(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="editNotes">Additional Notes</Label>
        <Textarea
          id="editNotes"
          value={editedTreatment.notes || ""}
          onChange={(e) => setEditedTreatment(prev => ({ ...prev, notes: e.target.value }))}
          rows={2}
        />
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}