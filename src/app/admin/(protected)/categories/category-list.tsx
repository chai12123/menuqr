'use client'
import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { addCategory, updateCategory, deleteCategory, reorderCategories } from './actions'

function SortableCategoryItem({ category, onEdit, onDelete, onToggle }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 mb-2 bg-card border rounded-lg shadow-sm">
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical size={20} />
      </div>
      <div className="flex-1">
        <p className="font-medium">{category.name_th}</p>
        <p className="text-sm text-muted-foreground">{category.name_en || '-'}</p>
      </div>
      <div className="text-sm text-muted-foreground hidden sm:block w-24 text-center">
        {category.items_count || 0} items
      </div>
      <Switch 
        checked={category.is_active} 
        onCheckedChange={(v) => onToggle(category.id, v)} 
      />
      <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
        <Pencil size={18} />
      </Button>
      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(category.id)}>
        <Trash2 size={18} />
      </Button>
    </div>
  )
}

export function CategoryList({ initialCategories, shopId }: { initialCategories: any[], shopId: string }) {
  const [categories, setCategories] = useState(initialCategories)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentEdit, setCurrentEdit] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        const newArray = arrayMove(items, oldIndex, newIndex)
        
        const updates = newArray.map((item, index) => ({ id: item.id, sort_order: index }))
        reorderCategories(updates) // async action, fire and forget for UI snappiness
        
        return newArray
      })
    }
  }

  const handleToggle = async (id: string, is_active: boolean) => {
    setCategories(items => items.map(c => c.id === id ? { ...c, is_active } : c))
    await updateCategory(id, { is_active })
    toast.success('Category updated')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? All items in it will have no category.')) {
      await deleteCategory(id)
      setCategories(items => items.filter(c => c.id !== id))
      toast.success('Category deleted')
    }
  }

  async function handleAddSubmit(formData: FormData) {
    setIsSubmitting(true)
    const res = await addCategory(formData)
    setIsSubmitting(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Category added')
      setIsAddOpen(false)
      window.location.reload()
    }
  }

  async function handleEditSubmit(formData: FormData) {
    setIsSubmitting(true)
    const name_th = formData.get('name_th') as string
    const name_en = formData.get('name_en') as string
    
    await updateCategory(currentEdit.id, { name_th, name_en })
    setCategories(items => items.map(c => c.id === currentEdit.id ? { ...c, name_th, name_en } : c))
    
    setIsSubmitting(false)
    toast.success('Category updated')
    setIsEditOpen(false)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage and reorder your menu categories.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form action={handleAddSubmit} className="space-y-4">
              <input type="hidden" name="shop_id" value={shopId} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Name (Thai) *</label>
                <Input name="name_th" required placeholder="e.g. เครื่องดื่ม" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name (English)</label>
                <Input name="name_en" placeholder="e.g. Beverages" />
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form action={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (Thai) *</label>
              <Input name="name_th" defaultValue={currentEdit?.name_th} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name (English)</label>
              <Input name="name_en" defaultValue={currentEdit?.name_en || ''} />
            </div>
            <Button type="submit" className="w-full bg-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Category'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {categories.length > 0 ? categories.map((cat: any) => (
            <SortableCategoryItem 
              key={cat.id} 
              category={cat} 
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={(c: any) => { setCurrentEdit(c); setIsEditOpen(true) }}
            />
          )) : (
            <div className="text-center p-8 border border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground">No categories yet. Add your first category!</p>
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}
