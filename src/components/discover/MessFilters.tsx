
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, FilterX } from "lucide-react";

interface MessFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  vegOnly: boolean;
  setVegOnly: (value: boolean) => void;
  nonVegOnly: boolean;
  setNonVegOnly: (value: boolean) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  resetFilters: () => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const MessFilters: React.FC<MessFiltersProps> = ({
  priceRange,
  setPriceRange,
  maxDistance,
  setMaxDistance,
  vegOnly,
  setVegOnly,
  nonVegOnly,
  setNonVegOnly,
  minRating,
  setMinRating,
  resetFilters,
  isOpen,
  setIsOpen
}) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full mb-6 border rounded-lg p-4 bg-white/50 dark:bg-gray-800/50 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter Options</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="flex items-center"
          >
            <FilterX className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="mt-4 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Price Range (₹ per month)</Label>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">₹{priceRange[0]}</span>
            <span className="text-sm">₹{priceRange[1]}</span>
          </div>
          <Slider 
            defaultValue={priceRange} 
            min={1000} 
            max={10000} 
            step={100}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="my-4"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Maximum Distance (km)</Label>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">1 km</span>
            <span className="text-sm">{maxDistance} km</span>
          </div>
          <Slider 
            defaultValue={[maxDistance]} 
            min={1} 
            max={50} 
            step={1}
            onValueChange={(value) => setMaxDistance(value[0])}
            className="my-4"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Minimum Rating</Label>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">1★</span>
            <span className="text-sm">5★</span>
          </div>
          <Slider 
            defaultValue={[minRating]} 
            min={1} 
            max={5} 
            step={0.5}
            onValueChange={(value) => setMinRating(value[0])}
            className="my-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="veg-only" className="cursor-pointer">Vegetarian Only</Label>
          <Switch 
            id="veg-only" 
            checked={vegOnly} 
            onCheckedChange={setVegOnly} 
            className="data-[state=checked]:bg-green-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="non-veg-only" className="cursor-pointer">Non-Vegetarian Available</Label>
          <Switch 
            id="non-veg-only" 
            checked={nonVegOnly} 
            onCheckedChange={setNonVegOnly}
            className="data-[state=checked]:bg-red-600"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MessFilters;
