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
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 mb-3 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-primary active:cursor-grabbing p-1">
        <GripVertical size={20} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-foreground">{category.name_th}</p>
        {category.name_en && <p className="text-xs text-muted-foreground font-medium">{category.name_en}</p>}
      </div>
      <div className="text-sm font-semibold text-muted-foreground hidden sm:block w-24 text-center bg-muted/50 rounded-lg py-1">
        {category.items_count || 0} เมนู
      </div>
      <Switch 
        checked={category.is_active} 
        onCheckedChange={(v) => onToggle(category.id, v)} 
      />
      <div className="flex gap-1 ml-2">
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-xl" onClick={() => onEdit(category)}>
          <Pencil size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => onDelete(category.id)}>
          <Trash2 size={18} />
        </Button>
      </div>
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
    toast.success('อัปเดตสถานะหมวดหมู่แล้ว')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้? เมนูอาหารที่อยู่ในหมวดหมู่นี้จะถูกเปลี่ยนเป็น "ไม่มีหมวดหมู่"')) {
      await deleteCategory(id)
      setCategories(items => items.filter(c => c.id !== id))
      toast.success('ลบหมวดหมู่เรียบร้อยแล้ว')
    }
  }

  async function handleAddSubmit(formData: FormData) {
    setIsSubmitting(true)
    const res = await addCategory(formData)
    setIsSubmitting(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('เพิ่มหมวดหมู่ใหม่แล้ว')
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
    toast.success('แก้ไขข้อมูลหมวดหมู่แล้ว')
    setIsEditOpen(false)
  }

  return (
    <div className="space-y-4 max-w-3xl pb-10">
      <div className="flex justify-end mb-6">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md h-11 px-6">
              <Plus className="mr-2 h-5 w-5" /> เพิ่มหมวดหมู่
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">เพิ่มหมวดหมู่ใหม่</DialogTitle>
            </DialogHeader>
            <form action={handleAddSubmit} className="space-y-5 pt-4">
              <input type="hidden" name="shop_id" value={shopId} />
              <div className="space-y-2">
                <label className="text-sm font-semibold">ชื่อหมวดหมู่ (ภาษาไทย) *</label>
                <Input name="name_th" required placeholder="เช่น อาหารจานหลัก, เครื่องดื่ม" className="bg-muted/50 rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">ชื่อหมวดหมู่ (ภาษาอังกฤษ)</label>
                <Input name="name_en" placeholder="เช่น Main Course, Beverages" className="bg-muted/50 rounded-xl h-12" />
              </div>
              <Button type="submit" className="w-full bg-primary font-bold rounded-xl h-12 text-base shadow-md" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">แก้ไขหมวดหมู่</DialogTitle>
          </DialogHeader>
          <form action={handleEditSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">ชื่อหมวดหมู่ (ภาษาไทย) *</label>
              <Input name="name_th" defaultValue={currentEdit?.name_th} required className="bg-muted/50 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">ชื่อหมวดหมู่ (ภาษาอังกฤษ)</label>
              <Input name="name_en" defaultValue={currentEdit?.name_en || ''} className="bg-muted/50 rounded-xl h-12" />
            </div>
            <Button type="submit" className="w-full bg-primary font-bold rounded-xl h-12 text-base shadow-md" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
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
            <div className="text-center p-12 border-2 border-dashed rounded-3xl bg-muted/20">
              <p className="text-muted-foreground font-medium text-lg">ยังไม่มีหมวดหมู่เมนูเลย เริ่มสร้างหมวดหมู่แรกของคุณกันเถอะ!</p>
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}
