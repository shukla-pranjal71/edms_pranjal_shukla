import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { countryService, Country } from "@/services/countryService";
interface CountryManagementTabProps {
  initialCountries?: string[];
  onCountriesChange?: (countries: string[]) => void;
}
interface ExtendedCountry extends Country {
  active?: boolean;
}
const CountryManagementTab: React.FC<CountryManagementTabProps> = ({
  initialCountries = [],
  onCountriesChange
}) => {
  const [countries, setCountries] = useState<ExtendedCountry[]>([]);
  const [newCountry, setNewCountry] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const {
    toast
  } = useToast();

  // Fetch countries from hardcoded data on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch all countries from hardcoded data
  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const data = await countryService.getAllCountries();
      const extendedData = data?.map(country => ({
        ...country,
        active: true
      })) || [];
      setCountries(extendedData);

      // Notify parent component of countries change
      if (onCountriesChange) {
        onCountriesChange(data?.map(country => country.name) || []);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast({
        title: "Failed to load countries",
        description: "There was a problem loading the countries list.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new country
  const handleAddCountry = async () => {
    if (!newCountry.trim()) {
      showErrorToast("Country name cannot be empty");
      return;
    }

    // Check if the country already exists (case-insensitive)
    if (countries.some(c => c.name.toLowerCase() === newCountry.trim().toLowerCase())) {
      showErrorToast("This country already exists in the list");
      return;
    }
    setIsLoading(true);
    try {
      const data = await countryService.createCountry(newCountry.trim());
      if (data) {
        // Refresh the countries list from the backend
        await fetchCountries();
        setNewCountry("");
        toast({
          title: "Country Added",
          description: `${newCountry.trim()} has been added to the list`
        });
      }
    } catch (error) {
      console.error('Error adding country:', error);
      toast({
        title: "Failed to add country",
        description: "There was a problem adding the country.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle country active status
  const handleToggleCountryStatus = async (country: ExtendedCountry) => {
    setIsLoading(true);
    try {
      const updatedCountries = countries.map(c => c.id === country.id ? {
        ...c,
        active: !c.active
      } : c);
      setCountries(updatedCountries);
      const newStatus = !country.active ? 'activated' : 'deactivated';
      toast({
        title: "Status Updated",
        description: `${country.name} has been ${newStatus}`
      });
    } catch (error) {
      console.error('Error toggling country status:', error);
      toast({
        title: "Failed to update status",
        description: "There was a problem updating the country status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a country
  const startEditing = (country: ExtendedCountry) => {
    setEditingCountry(country);
    setEditName(country.name);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCountry(null);
    setEditName("");
  };

  // Save edited country
  const saveEditedCountry = async () => {
    if (!editingCountry) return;
    if (!editName.trim()) {
      showErrorToast("Country name cannot be empty");
      return;
    }

    // Check if the country already exists (case-insensitive)
    if (countries.some(c => c.id !== editingCountry.id && c.name.toLowerCase() === editName.trim().toLowerCase())) {
      showErrorToast("This country already exists in the list");
      return;
    }
    setIsLoading(true);
    try {
      await countryService.updateCountry(editingCountry.id, editName.trim());

      // Refresh the countries list from the backend
      await fetchCountries();
      setEditingCountry(null);
      setEditName("");
      toast({
        title: "Country Updated",
        description: `Country has been updated to ${editName.trim()}`
      });
    } catch (error) {
      console.error('Error updating country:', error);
      toast({
        title: "Failed to update country",
        description: "There was a problem updating the country.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show error toast for validation failures
  const showErrorToast = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  };
  return <div className="h-full w-full flex flex-col">
      <Card className="flex-1 flex flex-col m-6">
        <CardHeader className="flex-shrink-0">
          
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-6">
          <div className="flex gap-4">
            <Input placeholder="Enter country name" value={newCountry} onChange={e => setNewCountry(e.target.value)} className="flex-1 dark:bg-gray-800 dark:text-white" disabled={isLoading} />
            <Button onClick={handleAddCountry} disabled={isLoading} className="flex items-center gap-2 whitespace-nowrap bg-[#117bbc] text-slate-50">
              <Plus className="h-4 w-4" />
              Add Country
            </Button>
          </div>
          
          <div className="flex-1 relative min-h-0">
            {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>}
            
            <div className="h-full overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="dark:text-gray-300">Country Name</TableHead>
                    <TableHead className="dark:text-gray-300">Enabled</TableHead>
                    <TableHead className="w-32 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countries.length > 0 ? countries.map(country => <TableRow key={country.id}>
                        <TableCell className="dark:text-white">
                          {editingCountry?.id === country.id ? <Input value={editName} onChange={e => setEditName(e.target.value)} className="dark:bg-gray-800 dark:text-white" /> : country.name}
                        </TableCell>
                        <TableCell>
                          <Switch checked={country.active !== false} onCheckedChange={() => handleToggleCountryStatus(country)} disabled={isLoading || !!editingCountry} className="bg-[#117bbc] text-slate-50" />
                        </TableCell>
                        <TableCell>
                          {editingCountry?.id === country.id ? <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={saveEditedCountry} className="text-green-500 hover:text-green-700" disabled={isLoading}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={cancelEditing} className="text-gray-500 hover:text-gray-700" disabled={isLoading}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div> : <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => startEditing(country)} className="text-blue-500 hover:text-blue-700" disabled={isLoading || !!editingCountry}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>}
                        </TableCell>
                      </TableRow>) : <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center dark:text-gray-300">
                        {isLoading ? "Loading..." : "No countries added yet"}
                      </TableCell>
                    </TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default CountryManagementTab;