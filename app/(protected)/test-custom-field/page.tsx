"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TestCustomFieldPage() {
  const [fieldName, setFieldName] = useState("Steps");
  const createField = useMutation(api.trackingFields.createTrackingField);
  const allFields = useQuery(api.trackingFields.getAllTrackingFields);
  const [result, setResult] = useState("");

  const handleCreate = async () => {
    try {
      const id = await createField({
        name: fieldName,
        type: "text",
        hasStreak: false,
      });
      setResult(`✅ Successfully created field: ${fieldName} (ID: ${id})`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Custom Field Creation</h1>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Test Field</h2>
        <div className="flex gap-4 items-center">
          <Input
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="Field name"
            className="max-w-xs"
          />
          <Button onClick={handleCreate}>Create Field</Button>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-muted rounded">{result}</div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">All Tracking Fields</h2>
        {allFields === undefined ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            {allFields.map((field) => (
              <div
                key={field._id}
                className="flex items-center justify-between p-3 border border-border rounded"
              >
                <div>
                  <span className="font-medium">{field.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({field.type})
                  </span>
                  {field.isDefault && (
                    <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                      DEFAULT
                    </span>
                  )}
                  {!field.isDefault && (
                    <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                      CUSTOM
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Order: {field.order} | Active: {field.isActive ? "Yes" : "No"}
                </div>
              </div>
            ))}
            <div className="mt-4 p-4 bg-muted/50 rounded">
              <p className="text-sm">
                <strong>Total:</strong> {allFields.length} fields
              </p>
              <p className="text-sm">
                <strong>Custom:</strong> {allFields.filter(f => !f.isDefault).length} fields
              </p>
              <p className="text-sm">
                <strong>Default:</strong> {allFields.filter(f => f.isDefault).length} fields
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
